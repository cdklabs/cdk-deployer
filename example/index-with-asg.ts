/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as cdk from '@aws-cdk/core';
import * as autoscaling from '@aws-cdk/aws-autoscaling';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as codedeploy from '@aws-cdk/aws-codedeploy';
import { Ec2Deployer, Code } from '../src';

export class TestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc')
    const asg = new autoscaling.AutoScalingGroup(this, 'Asg', {
      vpc,
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: ec2.MachineImage.latestAmazonLinux({generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2}),
    });
    const deploymentGroup = new codedeploy.ServerDeploymentGroup(this, 'DeploymentGroup', {
      autoScalingGroups: [asg]
    });
    
    const deployer = new Ec2Deployer(this, 'Deployer', {
        code: Code.fromAsset('app'),
        deploymentGroup,
    });
  }
}
