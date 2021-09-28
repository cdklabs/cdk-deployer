/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as s3 from '@aws-cdk/aws-s3';
import * as s3_assets from '@aws-cdk/aws-s3-assets';
import * as cdk from '@aws-cdk/core';

// keep this import separate from other imports to reduce chance for merge conflicts with v2-main
// eslint-disable-next-line no-duplicate-imports, import/order
import { Construct } from '@aws-cdk/core';

/**
 * Represents the Application Code.
 */
export abstract class Code {
  /**
   * Application code as an S3 object.
   * @param bucket The S3 bucket
   * @param key The object key
   * @param objectVersion Optional S3 object version
   */
  public static fromBucket(bucket: s3.IBucket, key: string, objectVersion?: string): S3Code {
    return new S3Code(bucket, key, objectVersion);
  }

  /**
   * Loads the application code from a local disk path.
   *
   * @param path Either a directory with the application code bundle or a .zip file
   */
  public static fromAsset(path: string, options?: s3_assets.AssetOptions): AssetCode {
    return new AssetCode(path, options);
  }

  /**
   * Called when the deployment object is initialized to allow this object to bind
   * to the stack, add resources and have fun.
   *
   * @param scope The binding scope. Don't be smart about trying to down-cast or
   * assume it's initialized. You may just use it as a construct scope.
   */
  public abstract bind(scope: Construct): CodeConfig;
}

/**
 * Result of binding `Code` into a `Ec2Deployer`.
 */
export interface CodeConfig {
  /**
   * The location of the code in S3.
   * @default - code is an s3 location
   */
  readonly s3Location: s3.Location;
}

/**
 * Application code from an S3 archive.
 */
export class S3Code extends Code {
  public readonly isInline = false;
  private bucketName: string;

  constructor(bucket: s3.IBucket, private key: string, private objectVersion?: string) {
    super();
    this.bucketName = bucket.bucketName;
  }

  public bind(_scope: Construct): CodeConfig {
    return {
      s3Location: {
        bucketName: this.bucketName,
        objectKey: this.key,
        objectVersion: this.objectVersion,
      },
    };
  }
}

/**
 * Application code from a local directory.
 */
export class AssetCode extends Code {
  private asset?: s3_assets.Asset;

  /**
   * @param path The path to the asset file or directory.
   */
  constructor(public readonly path: string, private readonly options: s3_assets.AssetOptions = { }) {
    super();
  }

  public bind(scope: Construct): CodeConfig {
    // If the same AssetCode is used multiple times, retain only the first instantiation.
    if (!this.asset) {
      this.asset = new s3_assets.Asset(scope, 'Code', {
        path: this.path,
        ...this.options,
      });
    } else if (cdk.Stack.of(this.asset) !== cdk.Stack.of(scope)) {
      throw new Error(`Asset is already associated with another stack '${cdk.Stack.of(this.asset).stackName}'. ` +
        'Create a new Code instance for every stack.');
    }

    if (!this.asset.isZipArchive) {
      throw new Error(`Asset must be a .zip file or a directory (${this.path})`);
    }

    return {
      s3Location: {
        bucketName: this.asset.s3BucketName,
        objectKey: this.asset.s3ObjectKey,
      },
    };
  }
}

export interface ResourceBindOptions {
  /**
   * The name of the CloudFormation property to annotate with asset metadata.
   * @see https://github.com/aws/aws-cdk/issues/1432
   * @default Code
   */
  readonly resourceProperty?: string;
}
