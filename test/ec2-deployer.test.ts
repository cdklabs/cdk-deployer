/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { anything, arrayWith, expect as expectCdk, haveResourceLike, objectLike } from '@aws-cdk/assert';
import * as autoscaling from '@aws-cdk/aws-autoscaling';
import * as codedeploy from '@aws-cdk/aws-codedeploy';
import { IServerDeploymentGroup } from '@aws-cdk/aws-codedeploy';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { Stack } from '@aws-cdk/core';
import { Ec2Deployer, Code } from '../src';

describe('Ec2Deployer', () => {
  let stack: cdk.Stack;
  let code: Code;
  let deploymentGroup: codedeploy.ServerDeploymentGroup;

  beforeEach(() => {
    const app = new cdk.App({
      context: {
        '@aws-cdk/core:newStyleStackSynthesis': true, // needed for proper resolving of asset values
      },
    });
    stack = new cdk.Stack(app);
    code = Code.fromAsset('test/dummy-artifact-asset');
    deploymentGroup = new codedeploy.ServerDeploymentGroup(stack, 'DeploymentGroup', {});
  });

  describe('created with only required props', () => {
    let ec2Deployer: Ec2Deployer;

    beforeEach(() => {
      ec2Deployer = new Ec2Deployer(stack, 'Ec2Deployer', {
        code,
        deploymentGroup,
      });
    });

    test('creates a Custom Resource with the appropriate input values', () => {
      const codeConfig = code.bind(stack);
      const codeS3BucketName = cdk.Tokenization.resolve(codeConfig.s3Location.bucketName, {
        scope: stack,
        resolver: new cdk.DefaultTokenResolver( new cdk.StringConcat() ),
      });
      const codeS3ObjectKey = cdk.Tokenization.resolve(codeConfig.s3Location.objectKey, {
        scope: stack,
        resolver: new cdk.DefaultTokenResolver( new cdk.StringConcat() ),
      });

      expectCdk(stack).to(haveResourceLike('AWS::CloudFormation::CustomResource', {
        applicationName: {
          Ref: 'DeploymentGroupApplication7B89ABEB',
        },
        deploymentGroupName: {
          Ref: 'DeploymentGroup6D277AF0',
        },
        codeS3BucketName: codeS3BucketName,
        codeS3ObjectKey: codeS3ObjectKey,
      }));
    });

    test('sets the proper default values', () => {
      expect(ec2Deployer.deploymentTimeout).toStrictEqual(cdk.Duration.minutes(5));
      expect(ec2Deployer.waitToComplete).toBe(true);
    });

    test('creates a IsCompleteHandler Lambda function', () => {
      expectCdk(stack).to(haveResourceLike('AWS::Lambda::Function', {
        Handler: 'index.is_complete',
      }));
    });
  });

  describe('created with Code.fromBucket() with no object version', () => {
    beforeEach(() => {
      const bucket = new s3.Bucket(stack, 'Bucket');
      code = Code.fromBucket(bucket, 'dummy-key');
      new Ec2Deployer(stack, 'Ec2Deployer', {
        code,
        deploymentGroup,
      });
    });

    test('creates a Custom Resource with the appropriate input values', () => {
      const codeConfig = code.bind(stack);
      const codeS3BucketName = cdk.Tokenization.resolve(codeConfig.s3Location.bucketName, {
        scope: stack,
        resolver: new cdk.DefaultTokenResolver( new cdk.StringConcat() ),
      });
      const codeS3ObjectKey = cdk.Tokenization.resolve(codeConfig.s3Location.objectKey, {
        scope: stack,
        resolver: new cdk.DefaultTokenResolver( new cdk.StringConcat() ),
      });

      expectCdk(stack).to(haveResourceLike('AWS::CloudFormation::CustomResource', {
        codeS3BucketName: codeS3BucketName,
        codeS3ObjectKey: codeS3ObjectKey,
      }));

      expectCdk(stack).notTo(haveResourceLike('AWS::CloudFormation::CustomResource', {
        codeS3ObjectVersion: anything(),
      }));
    });
  });

  describe('created with Code.fromBucket() with object version', () => {
    beforeEach(() => {
      const bucket = new s3.Bucket(stack, 'Bucket');
      code = Code.fromBucket(bucket, 'dummy-key', 'dummy-version');
      new Ec2Deployer(stack, 'Ec2Deployer', {
        code,
        deploymentGroup,
      });
    });

    test('creates a Custom Resource with the appropriate input values', () => {
      const codeConfig = code.bind(stack);
      const codeS3BucketName = cdk.Tokenization.resolve(codeConfig.s3Location.bucketName, {
        scope: stack,
        resolver: new cdk.DefaultTokenResolver( new cdk.StringConcat() ),
      });
      const codeS3ObjectKey = cdk.Tokenization.resolve(codeConfig.s3Location.objectKey, {
        scope: stack,
        resolver: new cdk.DefaultTokenResolver( new cdk.StringConcat() ),
      });

      expectCdk(stack).to(haveResourceLike('AWS::CloudFormation::CustomResource', {
        codeS3BucketName: codeS3BucketName,
        codeS3ObjectKey: codeS3ObjectKey,
        codeS3ObjectVersion: codeConfig.s3Location.objectVersion,
      }));
    });
  });

  describe('created with Code.fromAsset() with invalid Code path', () => {
    test('results in a validation error', () => {
      code = Code.fromAsset('test/dummy-artifact-asset/dummy-file.txt');
      expect(() => new Ec2Deployer(stack, 'Ec2Deployer', {
        code,
        deploymentGroup,
      })).toThrowError(/Asset must be a .zip file or a directory/);
    });
  });

  describe('created with Code.fromAsset() after already bound to other stack', () => {
    test('results in a validation error', () => {
      new Ec2Deployer(stack, 'Ec2Deployer', {
        code,
        deploymentGroup,
      });

      const stack2 = new Stack();
      expect(() => new Ec2Deployer(stack2, 'Ec2Deployer', {
        code,
        deploymentGroup,
      })).toThrowError(/Asset is already associated with another stack/);
    });
  });

  describe('created with waitToComplete=false', () => {
    let ec2Deployer: Ec2Deployer;
    const deploymentTimeout = cdk.Duration.minutes(30);
    const waitToComplete = false;

    beforeEach(() => {
      ec2Deployer = new Ec2Deployer(stack, 'Ec2Deployer', {
        code,
        deploymentGroup,
        deploymentTimeout,
        waitToComplete,
      });
    });

    test('sets the proper values', () => {
      expect(ec2Deployer.deploymentTimeout).toBe(undefined);
      expect(ec2Deployer.waitToComplete).toBe(waitToComplete);
    });

    test('does not create a IsCompleteHandler Lambda function', () => {
      expectCdk(stack).notTo(haveResourceLike('AWS::Lambda::Function', {
        Handler: 'index.is_complete',
      }));
    });
  });

  describe('created with non-default, valid deploymentTimeout', () => {
    let ec2Deployer: Ec2Deployer;
    const deploymentTimeout = cdk.Duration.minutes(30);

    beforeEach(() => {
      ec2Deployer = new Ec2Deployer(stack, 'Ec2Deployer', {
        code,
        deploymentGroup,
        deploymentTimeout,
      });
    });

    test('sets the proper values', () => {
      expect(ec2Deployer.deploymentTimeout).toBe(deploymentTimeout);
      expect(ec2Deployer.waitToComplete).toBe(true);
    });
  });

  describe('created with invalid deploymentTimeout', () => {
    test('results in a validation error', () => {
      expect(() => new Ec2Deployer(stack, 'Ec2Deployer', {
        code,
        deploymentGroup,
        deploymentTimeout: Ec2Deployer.MAX_DEPLOYMENT_TIMEOUT.plus(cdk.Duration.millis(1)),
      })).toThrowError(`Invalid prop: deploymentTimeout must be less than ${Ec2Deployer.MAX_DEPLOYMENT_TIMEOUT.toHumanString()}.`);
    });
  });

  describe('created with AutoScalingGroup', () => {
    test('adds permissions to ASG role', () => {
      deploymentGroup.addAutoScalingGroup(new autoscaling.AutoScalingGroup(stack, 'Asg', {
        vpc: new ec2.Vpc(stack, 'Vpc'),
        instanceType: new ec2.InstanceType('t2.micro'),
        machineImage: ec2.MachineImage.latestAmazonLinux({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2 }),
      }));

      new Ec2Deployer(stack, 'Ec2Deployer', {
        code,
        deploymentGroup,
      });

      expectCdk(stack).to(haveResourceLike('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: arrayWith(
            objectLike({
              Action: 's3:GetObject*',
              Effect: 'Allow',
            }),
          ),
        },
      }));
    });
  });

  describe('created with IServerDeploymentGroup', () => {
    let iDeploymentGroup: IServerDeploymentGroup;

    beforeEach(() => {
      iDeploymentGroup = codedeploy.ServerDeploymentGroup.fromServerDeploymentGroupAttributes(stack, 'IDeploymentGroup', {
        deploymentGroupName: 'dummy-name',
        application: codedeploy.ServerApplication.fromServerApplicationName(stack, 'Application', 'dummy-name'),
      });
    });

    test('synthesizes properly when instanceRoles is passed in', () => {
      new Ec2Deployer(stack, 'Ec2Deployer', {
        code,
        deploymentGroup: iDeploymentGroup,
        instanceRoles: [iam.Role.fromRoleArn(stack, 'Role', 'arn:aws:iam::123456789012:role/dummy-role-name')],
      });
    });

    test('results in a validation error when no instanceRole is passed in', () => {
      expect(() => new Ec2Deployer(stack, 'Ec2Deployer', {
        code,
        deploymentGroup: iDeploymentGroup,
      })).toThrowError('If deploymentGroup is of type IServerDeploymentGroup, you must supply at least one role in instanceRoles.');
    });

    test('results in a validation error when empty instanceRoles array is passed in', () => {
      expect(() => new Ec2Deployer(stack, 'Ec2Deployer', {
        code,
        deploymentGroup: iDeploymentGroup,
        instanceRoles: [],
      })).toThrowError('If deploymentGroup is of type IServerDeploymentGroup, you must supply at least one role in instanceRoles.');
    });
  });
});