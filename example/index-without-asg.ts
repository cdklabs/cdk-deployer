/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as cdk from '@aws-cdk/core';
import * as codedeploy from '@aws-cdk/aws-codedeploy';
import * as iam from '@aws-cdk/aws-iam';
import { Ec2Deployer, Code } from '../src';

export class TestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const deploymentGroup = codedeploy.ServerDeploymentGroup.fromServerDeploymentGroupAttributes(this, 'DeploymentGroup', {
        deploymentGroupName: 'deployment-group-name',
        application: codedeploy.ServerApplication.fromServerApplicationName(this, 'Application', 'application-name')
    });

    const instanceRole = iam.Role.fromRoleArn(this, 'Role', cdk.Arn.format({
        service: 'iam',
        resource: 'role',
        resourceName: 'instance-role-name' // role assigned to target instances associated with deployment group
    }, cdk.Stack.of(this)));

    const deployer = new Ec2Deployer(this, 'Deployer', {
        code: Code.fromAsset('app'),
        deploymentGroup,
        instanceRoles: [instanceRole]
    });
  }
}
