export interface NetworkConstructProps {
  /**
   * The name of the environment (e.g., 'sandbox', 'staging', 'prod')
   */
  readonly envName: string;

  /**
   * The AWS region
   */
  readonly awsRegion: string;

  /**
   * The VPC name
   */
  readonly vpcName: string;

  /**
   * The EKS cluster name
   */
  readonly clusterName: string;

  /**
   * The VPC CIDR block
   * @default "10.10.0.0/16"
   */
  readonly mainVpcCidr?: string;

  /**
   * Public subnet A CIDR
   * @default "10.10.0.0/18"
   */
  readonly publicSubnetACidr?: string;

  /**
   * Public subnet B CIDR
   * @default "10.10.64.0/18"
   */
  readonly publicSubnetBCidr?: string;

  /**
   * Private subnet A CIDR
   * @default "10.10.128.0/18"
   */
  readonly privateSubnetACidr?: string;

  /**
   * Private subnet B CIDR
   * @default "10.10.192.0/18"
   */
  readonly privateSubnetBCidr?: string;
}
