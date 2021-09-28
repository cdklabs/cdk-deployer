# API Reference <a name="API Reference"></a>

## Constructs <a name="Constructs"></a>

### Ec2Deployer <a name="cdk-deployer.Ec2Deployer"></a>

Represents a Deployer resource for deploying an artifact to EC2 using CodeDeploy.

#### Initializers <a name="cdk-deployer.Ec2Deployer.Initializer"></a>

```typescript
import { Ec2Deployer } from 'cdk-deployer'

new Ec2Deployer(scope: Construct, id: string, props: Ec2DeployerProps)
```

##### `scope`<sup>Required</sup> <a name="cdk-deployer.Ec2Deployer.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

##### `id`<sup>Required</sup> <a name="cdk-deployer.Ec2Deployer.parameter.id"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="cdk-deployer.Ec2Deployer.parameter.props"></a>

- *Type:* [`cdk-deployer.Ec2DeployerProps`](#cdk-deployer.Ec2DeployerProps)

---



#### Properties <a name="Properties"></a>

##### `code`<sup>Required</sup> <a name="cdk-deployer.Ec2Deployer.property.code"></a>

```typescript
public readonly code: CodeConfig;
```

- *Type:* [`cdk-deployer.CodeConfig`](#cdk-deployer.CodeConfig)

The source code to be deployed.

---

##### `deploymentGroup`<sup>Required</sup> <a name="cdk-deployer.Ec2Deployer.property.deploymentGroup"></a>

```typescript
public readonly deploymentGroup: IServerDeploymentGroup;
```

- *Type:* [`@aws-cdk/aws-codedeploy.IServerDeploymentGroup`](#@aws-cdk/aws-codedeploy.IServerDeploymentGroup)

The deployment group being deployed to.

---

##### `waitToComplete`<sup>Required</sup> <a name="cdk-deployer.Ec2Deployer.property.waitToComplete"></a>

```typescript
public readonly waitToComplete: boolean;
```

- *Type:* `boolean`

Whether the enclosing stack will wait for the deployment to complete.

---

##### `deploymentTimeout`<sup>Optional</sup> <a name="cdk-deployer.Ec2Deployer.property.deploymentTimeout"></a>

```typescript
public readonly deploymentTimeout: Duration;
```

- *Type:* [`@aws-cdk/core.Duration`](#@aws-cdk/core.Duration)

Amount of time the stack will wait for the deployment operation to complete.

---

##### `instanceRoles`<sup>Optional</sup> <a name="cdk-deployer.Ec2Deployer.property.instanceRoles"></a>

```typescript
public readonly instanceRoles: IRole[];
```

- *Type:* [`@aws-cdk/aws-iam.IRole`](#@aws-cdk/aws-iam.IRole)[]

The IAM roles associated with the target instances to be deployed to.

This is used to ensure the target instances have the appropriate permissions to download the deployment artifact from S3.
This prop is only required when the instance roles cannot be dynamically pulled from the supplied deploymentGroup's autoScalingGroups property,
for example when deploymentGroup is of type IServerDeploymentGroup or if the deploymentGroup is not associated with an ASG.

---

#### Constants <a name="Constants"></a>

##### `MAX_DEPLOYMENT_TIMEOUT` <a name="cdk-deployer.Ec2Deployer.property.MAX_DEPLOYMENT_TIMEOUT"></a>

- *Type:* [`@aws-cdk/core.Duration`](#@aws-cdk/core.Duration)

Maximum allowed value for deploymentTimeout prop.

---

## Structs <a name="Structs"></a>

### CodeConfig <a name="cdk-deployer.CodeConfig"></a>

Result of binding `Code` into a `Ec2Deployer`.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { CodeConfig } from 'cdk-deployer'

const codeConfig: CodeConfig = { ... }
```

##### `s3Location`<sup>Required</sup> <a name="cdk-deployer.CodeConfig.property.s3Location"></a>

```typescript
public readonly s3Location: Location;
```

- *Type:* [`@aws-cdk/aws-s3.Location`](#@aws-cdk/aws-s3.Location)
- *Default:* code is an s3 location

The location of the code in S3.

---

### Ec2DeployerProps <a name="cdk-deployer.Ec2DeployerProps"></a>

Construction properties for the Ec2Deployer object.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { Ec2DeployerProps } from 'cdk-deployer'

const ec2DeployerProps: Ec2DeployerProps = { ... }
```

##### `code`<sup>Required</sup> <a name="cdk-deployer.Ec2DeployerProps.property.code"></a>

```typescript
public readonly code: Code;
```

- *Type:* [`cdk-deployer.Code`](#cdk-deployer.Code)

The source code to be deployed.

---

##### `deploymentGroup`<sup>Required</sup> <a name="cdk-deployer.Ec2DeployerProps.property.deploymentGroup"></a>

```typescript
public readonly deploymentGroup: IServerDeploymentGroup;
```

- *Type:* [`@aws-cdk/aws-codedeploy.IServerDeploymentGroup`](#@aws-cdk/aws-codedeploy.IServerDeploymentGroup)

The deployment group to deploy the artifact to.

---

##### `deploymentTimeout`<sup>Optional</sup> <a name="cdk-deployer.Ec2DeployerProps.property.deploymentTimeout"></a>

```typescript
public readonly deploymentTimeout: Duration;
```

- *Type:* [`@aws-cdk/core.Duration`](#@aws-cdk/core.Duration)
- *Default:* 5 minutes

Amount of time the stack will wait for the deployment operation to complete, for a maximum of 2 hours.

Has no effect if waitToComplete = false.

---

##### `instanceRoles`<sup>Optional</sup> <a name="cdk-deployer.Ec2DeployerProps.property.instanceRoles"></a>

```typescript
public readonly instanceRoles: IRole[];
```

- *Type:* [`@aws-cdk/aws-iam.IRole`](#@aws-cdk/aws-iam.IRole)[]
- *Default:* gets the instance roles from serverDeploymentGroup.autoScalingGroups[].role

The IAM roles associated with the target instances to be deployed to.

This is used to ensure the target instances have the appropriate permissions to download the deployment artifact from S3.
This prop is only required when the instance roles cannot be dynamically pulled from the supplied deploymentGroup's autoScalingGroups property,
for example when deploymentGroup is of type IServerDeploymentGroup or if the deploymentGroup is not associated with an ASG.

---

##### `waitToComplete`<sup>Optional</sup> <a name="cdk-deployer.Ec2DeployerProps.property.waitToComplete"></a>

```typescript
public readonly waitToComplete: boolean;
```

- *Type:* `boolean`
- *Default:* true

Whether the enclosing stack should wait for the deployment to complete.

---

### ResourceBindOptions <a name="cdk-deployer.ResourceBindOptions"></a>

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { ResourceBindOptions } from 'cdk-deployer'

const resourceBindOptions: ResourceBindOptions = { ... }
```

##### `resourceProperty`<sup>Optional</sup> <a name="cdk-deployer.ResourceBindOptions.property.resourceProperty"></a>

```typescript
public readonly resourceProperty: string;
```

- *Type:* `string`
- *Default:* Code

The name of the CloudFormation property to annotate with asset metadata.

> https://github.com/aws/aws-cdk/issues/1432

---

## Classes <a name="Classes"></a>

### AssetCode <a name="cdk-deployer.AssetCode"></a>

Application code from a local directory.

#### Initializers <a name="cdk-deployer.AssetCode.Initializer"></a>

```typescript
import { AssetCode } from 'cdk-deployer'

new AssetCode(path: string, options?: AssetOptions)
```

##### `path`<sup>Required</sup> <a name="cdk-deployer.AssetCode.parameter.path"></a>

- *Type:* `string`

The path to the asset file or directory.

---

##### `options`<sup>Optional</sup> <a name="cdk-deployer.AssetCode.parameter.options"></a>

- *Type:* [`@aws-cdk/aws-s3-assets.AssetOptions`](#@aws-cdk/aws-s3-assets.AssetOptions)

---

#### Methods <a name="Methods"></a>

##### `bind` <a name="cdk-deployer.AssetCode.bind"></a>

```typescript
public bind(scope: Construct)
```

###### `scope`<sup>Required</sup> <a name="cdk-deployer.AssetCode.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---


#### Properties <a name="Properties"></a>

##### `path`<sup>Required</sup> <a name="cdk-deployer.AssetCode.property.path"></a>

```typescript
public readonly path: string;
```

- *Type:* `string`

The path to the asset file or directory.

---


### Code <a name="cdk-deployer.Code"></a>

Represents the Application Code.

#### Initializers <a name="cdk-deployer.Code.Initializer"></a>

```typescript
import { Code } from 'cdk-deployer'

new Code()
```

#### Methods <a name="Methods"></a>

##### `bind` <a name="cdk-deployer.Code.bind"></a>

```typescript
public bind(scope: Construct)
```

###### `scope`<sup>Required</sup> <a name="cdk-deployer.Code.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

The binding scope.

Don't be smart about trying to down-cast or
assume it's initialized. You may just use it as a construct scope.

---

#### Static Functions <a name="Static Functions"></a>

##### `fromAsset` <a name="cdk-deployer.Code.fromAsset"></a>

```typescript
import { Code } from 'cdk-deployer'

Code.fromAsset(path: string, options?: AssetOptions)
```

###### `path`<sup>Required</sup> <a name="cdk-deployer.Code.parameter.path"></a>

- *Type:* `string`

Either a directory with the application code bundle or a .zip file.

---

###### `options`<sup>Optional</sup> <a name="cdk-deployer.Code.parameter.options"></a>

- *Type:* [`@aws-cdk/aws-s3-assets.AssetOptions`](#@aws-cdk/aws-s3-assets.AssetOptions)

---

##### `fromBucket` <a name="cdk-deployer.Code.fromBucket"></a>

```typescript
import { Code } from 'cdk-deployer'

Code.fromBucket(bucket: IBucket, key: string, objectVersion?: string)
```

###### `bucket`<sup>Required</sup> <a name="cdk-deployer.Code.parameter.bucket"></a>

- *Type:* [`@aws-cdk/aws-s3.IBucket`](#@aws-cdk/aws-s3.IBucket)

The S3 bucket.

---

###### `key`<sup>Required</sup> <a name="cdk-deployer.Code.parameter.key"></a>

- *Type:* `string`

The object key.

---

###### `objectVersion`<sup>Optional</sup> <a name="cdk-deployer.Code.parameter.objectVersion"></a>

- *Type:* `string`

Optional S3 object version.

---



### S3Code <a name="cdk-deployer.S3Code"></a>

Application code from an S3 archive.

#### Initializers <a name="cdk-deployer.S3Code.Initializer"></a>

```typescript
import { S3Code } from 'cdk-deployer'

new S3Code(bucket: IBucket, key: string, objectVersion?: string)
```

##### `bucket`<sup>Required</sup> <a name="cdk-deployer.S3Code.parameter.bucket"></a>

- *Type:* [`@aws-cdk/aws-s3.IBucket`](#@aws-cdk/aws-s3.IBucket)

---

##### `key`<sup>Required</sup> <a name="cdk-deployer.S3Code.parameter.key"></a>

- *Type:* `string`

---

##### `objectVersion`<sup>Optional</sup> <a name="cdk-deployer.S3Code.parameter.objectVersion"></a>

- *Type:* `string`

---

#### Methods <a name="Methods"></a>

##### `bind` <a name="cdk-deployer.S3Code.bind"></a>

```typescript
public bind(_scope: Construct)
```

###### `_scope`<sup>Required</sup> <a name="cdk-deployer.S3Code.parameter._scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---


#### Properties <a name="Properties"></a>

##### `isInline`<sup>Required</sup> <a name="cdk-deployer.S3Code.property.isInline"></a>

```typescript
public readonly isInline: boolean;
```

- *Type:* `boolean`

---



