
# Deployer CDK Construct

This is a CDK construct library for deploying artifacts via CodeDeploy.

This library currently supports NodeJS and Python.


## Installation 

Install with npm

```bash 
$ npm install cdk-deployer
```
    
Install with pip

```bash 
$ pip install cdk-deployer
```
    
## Usage/Examples

### TypeScript:

With `codeDeploy.ServerDeploymentGroup`:

```javascript
import * as cdk from '@aws-cdk/core';
import * as autoscaling from '@aws-cdk/aws-autoscaling';
import * as codedeploy from '@aws-cdk/aws-codedeploy';
import { Ec2Deployer, Code } from 'cdk-deployer';

const asg = new autoscaling.AutoScalingGroup(this, 'Asg', {
    ...
});
const deploymentGroup = new codedeploy.ServerDeploymentGroup(this, 'DeploymentGroup', {
    autoScalingGroups: [asg]
});

const deployer = new Ec2Deployer(this, 'Deployer', {
    code: Code.fromAsset('path/to/code/directory'),
    deploymentGroup,
});
```

With `codeDeploy.IServerDeploymentGroup`, also need to specify `instanceRoles`:

```javascript
import * as cdk from '@aws-cdk/core';
import * as codedeploy from '@aws-cdk/aws-codedeploy';
import * as iam from '@aws-cdk/aws-iam';
import { Ec2Deployer, Code } from 'cdk-deployer';

const deploymentGroup = codedeploy.ServerDeploymentGroup.fromServerDeploymentGroupAttributes(this, 'DeploymentGroup', {
    ...
});

const instanceRole = iam.Role.fromRoleArn(this, 'Role', cdk.Arn.format({
    service: 'iam',
    resource: 'role',
    resourceName: 'instance-role-name' // role assigned to target instances associated with deployment group
}, cdk.Stack.of(this)));

const deployer = new Ec2Deployer(this, 'Deployer', {
    code: Code.fromAsset('path/to/code/directory'),
    deploymentGroup,
    instanceRoles: [instanceRole]
});
```

### Python:

With `codeDeploy.ServerDeploymentGroup`:

```python
from aws_cdk import (
    core as cdk,
    aws_codedeploy as codedeploy,
    aws_autoscaling as autoscaling,
)
from cdk_deployer import (
    Ec2Deployer,
    Code
)

asg = autoscaling.AutoScalingGroup(self, 'Asg',
    ...)
deployment_group = codedeploy.ServerDeploymentGroup(self, 'DeploymentGroup', 
    auto_scaling_groups=[asg])

deployment = Ec2Deployer(self, 'Deployment',
    code=Code.from_asset('path/to/code/directory'),
    deployment_group=deployment_group)
```

With `codeDeploy.IServerDeploymentGroup`, also need to specify `instance_roles`:

```python
from aws_cdk import (
    core as cdk,
    aws_autoscaling as autoscaling,
    aws_codedeploy as codedeploy,
    aws_iam as iam,
)
from cdk_deployer import (
    Ec2Deployer,
    Code
)

deployment_group = codedeploy.ServerDeploymentGroup.from_server_deployment_group_attributes(self, 'DeploymentGroup',
    ...)

instance_role = iam.Role.from_role_arn(self, 'Role', cdk.Arn.format(
    components=cdk.ArnComponents(
        service='iam',
        resource='role',
        resource_name='instance-role-name'),
    stack=cdk.Stack.of(self)
))

deployment = Ec2Deployer(self, 'Deployment',
    code=Code.from_asset('app'),
    deployment_group=deployment_group,
    instance_roles=[instance_role])
```

See [example folder](./example) for a more complete example.
## Contributing

Contributions of all kinds are welcome and celebrated. Raise an issue, submit a PR, do the right thing.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contributing guidelines.


## License

[Apache 2.0](./LICENSE)