/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as path from 'path';

import * as autoscaling from '@aws-cdk/aws-autoscaling';
import * as codedeploy from '@aws-cdk/aws-codedeploy';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import * as customresources from '@aws-cdk/custom-resources';
import { Code, CodeConfig } from './code';

/**
 * Construction properties for the Ec2Deployer object
 */
export interface Ec2DeployerProps {
  /**
     * The source code to be deployed.
     *
     */
  readonly code: Code;

  /**
     * The deployment group to deploy the artifact to.
     *
     */
  readonly deploymentGroup: codedeploy.IServerDeploymentGroup;

  /**
     * Whether the enclosing stack should wait for the deployment to complete.
     *
     * @default - true
     */
  readonly waitToComplete?: boolean;

  /**
     * Amount of time the stack will wait for the deployment operation to complete, for a maximum of 2 hours. Has no effect if waitToComplete = false.
     *
     * @default - 5 minutes
     */
  readonly deploymentTimeout?: cdk.Duration;

  /**
   * The IAM roles associated with the target instances to be deployed to. This is used to ensure the target instances have the appropriate permissions to download the deployment artifact from S3.
   * This prop is only required when the instance roles cannot be dynamically pulled from the supplied deploymentGroup's autoScalingGroups property,
   * for example when deploymentGroup is of type IServerDeploymentGroup or if the deploymentGroup is not associated with an ASG.
   *
   * @default - gets the instance roles from serverDeploymentGroup.autoScalingGroups[].role
   */
  readonly instanceRoles?: iam.IRole[];
};

/**
 * Represents a Deployer resource for deploying an artifact to EC2 using CodeDeploy.
 *
 */
export class Ec2Deployer extends cdk.Construct {
  /**
   * Maximum allowed value for deploymentTimeout prop.
   *
   */
  public static readonly MAX_DEPLOYMENT_TIMEOUT: cdk.Duration = cdk.Duration.hours(2);

  /**
   * The deployment group being deployed to.
   */
  public readonly deploymentGroup: codedeploy.IServerDeploymentGroup;

  /**
     * The source code to be deployed.
     *
     */
  public readonly code: CodeConfig;

  /**
   * Whether the enclosing stack will wait for the deployment to complete.
   *
   */
  public readonly waitToComplete: boolean;

  /**
   * Amount of time the stack will wait for the deployment operation to complete.
   *
   */
  public readonly deploymentTimeout?: cdk.Duration;

  /**
   * The IAM roles associated with the target instances to be deployed to. This is used to ensure the target instances have the appropriate permissions to download the deployment artifact from S3.
   * This prop is only required when the instance roles cannot be dynamically pulled from the supplied deploymentGroup's autoScalingGroups property,
   * for example when deploymentGroup is of type IServerDeploymentGroup or if the deploymentGroup is not associated with an ASG.
   *
   */
  public readonly instanceRoles?: iam.IRole[];


  constructor(scope: cdk.Construct, id: string, props: Ec2DeployerProps) {
    // Validate that props.deploymentTimeout is less than 2 hours, per maximum value accepted by downstream customresources.Provider.totalTimeout
    if (props.deploymentTimeout && props.deploymentTimeout.toMilliseconds() > Ec2Deployer.MAX_DEPLOYMENT_TIMEOUT.toMilliseconds()) { // have to convert to milliseconds in case the cdk.Duration is passed in milliseconds
      throw new Error(`Invalid prop: deploymentTimeout must be less than ${Ec2Deployer.MAX_DEPLOYMENT_TIMEOUT.toHumanString()}.`);
    }

    // Validate that at least one instanceRole is supplied if we cannot get them from deploymentGroup.autoScalingGroups
    if (!props.deploymentGroup.autoScalingGroups && (!props.instanceRoles || props.instanceRoles.length === 0)) {
      throw new Error('If deploymentGroup is of type IServerDeploymentGroup, you must supply at least one role in instanceRoles.');
    }

    super(scope, id);

    // Set defaults for any missing props
    this.code = props.code.bind(this);
    this.deploymentGroup = props.deploymentGroup;
    this.waitToComplete = props.waitToComplete !== undefined ? props.waitToComplete : true;
    this.deploymentTimeout = this.waitToComplete ? props.deploymentTimeout || cdk.Duration.minutes(5) : undefined; // can only be defined if waitToComplete=true because of downstream customresources.Provider.totalTimeout

    // Create OnEventHandler Lambda function for custom resource
    // Can't use SingletonFunction because permissions are dependent on props passed into each Ec2Deployer instance
    const onEvent = new lambda.Function(this, 'OnEventHandler', {
    // const onEvent = new lambda.SingletonFunction(this, 'OnEventHandler', {
    //   uuid: '3a9c56a9-1dd5-42dc-af2f-10b76edde830',
      code: lambda.Code.fromAsset(path.join(__dirname, '../custom-resource-runtime/ec2-deployer')),
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'index.on_event',
      initialPolicy: [
        new iam.PolicyStatement({
          actions: ['codedeploy:GetDeploymentConfig'],
          resources: [codedeploy.ServerDeploymentConfig.ONE_AT_A_TIME.deploymentConfigArn],
        }),
        new iam.PolicyStatement({
          actions: ['codedeploy:CreateDeployment'],
          resources: [this.deploymentGroup.deploymentGroupArn],
        }),
        new iam.PolicyStatement({
          actions: ['codedeploy:GetApplicationRevision', 'codedeploy:RegisterApplicationRevision'],
          resources: [this.deploymentGroup.application.applicationArn],
        }),
      ],
    });

    // Create IsCompleteHandler Lambda function for custom resource, only if waitToComplete=true
    // Can't use SingletonFunction because permissions are dependent on props passed into each Ec2Deployer instance
    let isComplete = undefined;
    if (this.waitToComplete) {
      // isComplete = new lambda.SingletonFunction(this, 'IsCompleteHandler', {
      //   uuid: 'f58e4e2e-8b7e-4bd0-b33b-c5c9f19f5546',
      isComplete = new lambda.Function(this, 'IsCompleteHandler', {
        code: lambda.Code.fromAsset(path.join(__dirname, '../custom-resource-runtime/ec2-deployer')),
        runtime: lambda.Runtime.PYTHON_3_8,
        handler: 'index.is_complete',
        initialPolicy: [
          new iam.PolicyStatement({
            resources: [this.deploymentGroup.deploymentGroupArn],
            actions: ['codedeploy:GetDeployment'],
          }),
        ],
      });
    }

    // Create provider for custom resource
    const deployerProvider = new customresources.Provider(this, 'Provider', {
      onEventHandler: onEvent,
      totalTimeout: this.deploymentTimeout,
      isCompleteHandler: isComplete,
    });

    // Ensure ASGs have read access to code S3 object for deployment
    const policyStatement = new iam.PolicyStatement({
      actions: ['s3:GetObject*'],
      resources: [`arn:${cdk.Stack.of(this).partition}:s3:::${this.code.s3Location.bucketName}/${this.code.s3Location.objectKey}`],
    });
    if (props.instanceRoles) {
      for (let role of props.instanceRoles) {
        role.addToPrincipalPolicy(policyStatement);
      }
    } else {
      for (let asg of this.deploymentGroup.autoScalingGroups!) {
        (asg as autoscaling.AutoScalingGroup).role.addToPrincipalPolicy(policyStatement);
      }
    }

    // Create custom resource that triggers a deployment
    new cdk.CustomResource(this, 'CustomResource', {
      serviceToken: deployerProvider.serviceToken,
      properties: {
        applicationName: this.deploymentGroup.application.applicationName,
        deploymentGroupName: this.deploymentGroup.deploymentGroupName,
        codeS3BucketName: this.code.s3Location.bucketName,
        codeS3ObjectKey: this.code.s3Location.objectKey,
        codeS3ObjectVersion: this.code.s3Location.objectVersion,
      },
    });
  }
}
