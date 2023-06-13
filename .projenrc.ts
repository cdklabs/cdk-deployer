import { awscdk } from 'projen';

const project = new awscdk.AwsCdkConstructLibrary({
  name: 'cdk-deployer',
  projenrcTs: true,
  description: 'A construct library for deploying artifacts via CodeDeploy inside of a AWS CDK application.',
  author: 'Jeff Gardner',
  authorAddress: 'https://aws.amazon.com',
  majorVersion: 1,
  cdkVersion: '1.173.0',
  defaultReleaseBranch: 'main',
  cdkDependenciesAsDeps: false,
  repositoryUrl: 'https://github.com/cdklabs/cdk-deployer',
  licensed: false,
  gitignore: ['.DS_Store', '!/LICENSE', '/.vscode/'],
  npmignore: ['/example'],
  keywords: [
    'aws-cdk',
    'deploy',
    'codedeploy',
    'ci-cd',
    'aws',
    'amazon',
  ],
  deps: [
    '@aws-cdk/aws-autoscaling',
    '@aws-cdk/aws-codedeploy',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-s3-assets',
    '@aws-cdk/core',
    '@aws-cdk/custom-resources',
  ],
  publishToPypi: {
    distName: 'cdk-deployer',
    module: 'cdk_deployer',
  },
});

project.addFields({
  awslint: {
    exclude: [
      'props-physical-name:cdk-deployer.Ec2DeployerProps',
    ],
  },
  license: 'Apache-2.0',
});

project.synth();