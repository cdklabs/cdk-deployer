const { AwsCdkConstructLibrary } = require('projen');

const project = new AwsCdkConstructLibrary({
  name: 'cdk-deployer',
  description: 'A construct library for deploying artifacts via CodeDeploy inside of a AWS CDK application.',
  authorName: 'Jeff Gardner',
  majorVersion: 1,
  cdkVersion: '1.116.0',
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
  cdkDependencies: [
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