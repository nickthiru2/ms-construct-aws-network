// import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface MsConstructAwsNetworkProps {
  // Define construct properties here
}

export class MsConstructAwsNetwork extends Construct {

  constructor(scope: Construct, id: string, props: MsConstructAwsNetworkProps = {}) {
    super(scope, id);

    // Define construct contents here

    // example resource
    // const queue = new sqs.Queue(this, 'MsConstructAwsNetworkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
