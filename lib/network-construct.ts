import { Construct } from "constructs";
import { CfnOutput, Tags } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";

import { NetworkConstructProps } from "#types/network-construct-props";

export class NetworkConstruct extends Construct {
  public readonly vpc: ec2.IVpc;
  public readonly publicSubnets: ec2.ISubnet[];
  public readonly privateSubnets: ec2.ISubnet[];

  constructor(scope: Construct, id: string, props: NetworkConstructProps) {
    super(scope, id);

    const {
      envName,
      awsRegion,
      vpcName,
      clusterName,
      mainVpcCidr = "10.10.0.0/16",
      publicSubnetACidr = "10.10.0.0/18",
      publicSubnetBCidr = "10.10.64.0/18",
      privateSubnetACidr = "10.10.128.0/18",
      privateSubnetBCidr = "10.10.192.0/18",
    } = props;

    // Create VPC with custom subnets to match the book's exact CIDR ranges
    const vpc = new ec2.Vpc(this, "Vpc", {
      ipAddresses: ec2.IpAddresses.cidr(mainVpcCidr),
      maxAzs: 2,
      natGateways: 2, // One NAT per AZ as per the book
      subnetConfiguration: [
        {
          name: "PublicSubnetA",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 18,
          mapPublicIpOnLaunch: true,
        },
        {
          name: "PublicSubnetB",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 18,
          mapPublicIpOnLaunch: true,
        },
        {
          name: "PrivateSubnetA",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 18,
        },
        {
          name: "PrivateSubnetB",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 18,
        },
      ],
      enableDnsHostnames: true,
      enableDnsSupport: true,
    });

    // Apply specific CIDR blocks to subnets
    const applyCidrToSubnet = (subnet: ec2.ISubnet, cidr: string) => {
      const cfnSubnet = subnet.node.defaultChild as ec2.CfnSubnet;
      cfnSubnet.cidrBlock = cidr;
      cfnSubnet.addPropertyOverride("CidrBlock", cidr);
    };

    // Apply exact CIDR blocks to match the book's configuration
    applyCidrToSubnet(vpc.publicSubnets[0], publicSubnetACidr);
    applyCidrToSubnet(vpc.publicSubnets[1], publicSubnetBCidr);
    applyCidrToSubnet(vpc.privateSubnets[0], privateSubnetACidr);
    applyCidrToSubnet(vpc.privateSubnets[1], privateSubnetBCidr);

    // Add Kubernetes tags to all subnets
    const tagSubnet = (
      subnet: ec2.ISubnet,
      isPublic: boolean,
      azLetter: string
    ) => {
      const type = isPublic ? "public" : "private";
      const name = `${envName}-${type}-subnet-${awsRegion}${azLetter}`;

      // Add standard tags
      Tags.of(subnet).add(`kubernetes.io/cluster/${clusterName}`, "shared");

      // Add ELB tags
      if (isPublic) {
        Tags.of(subnet).add("kubernetes.io/role/elb", "1");
      } else {
        Tags.of(subnet).add("kubernetes.io/role/internal-elb", "1");
      }

      // Add name tag
      Tags.of(subnet).add("Name", name);
    };

    // Tag all subnets
    tagSubnet(vpc.publicSubnets[0], true, "a");
    tagSubnet(vpc.publicSubnets[1], true, "b");
    tagSubnet(vpc.privateSubnets[0], false, "a");
    tagSubnet(vpc.privateSubnets[1], false, "b");

    // Add VPC Flow Logs
    vpc.addFlowLog("FlowLog", {
      trafficType: ec2.FlowLogTrafficType.ALL,
      destination: ec2.FlowLogDestination.toCloudWatchLogs(),
    });

    // Store references
    this.vpc = vpc;
    this.publicSubnets = vpc.publicSubnets;
    this.privateSubnets = vpc.privateSubnets;

    // Add standard tags to all resources in this construct
    Tags.of(this).add("Environment", envName);
    Tags.of(this).add("ManagedBy", "CDK");
    Tags.of(this).add("Project", "MicroservicesUpRunning");
    Tags.of(this.vpc).add("Name", vpcName);

    // Outputs
    new CfnOutput(this, "VpcId", { value: vpc.vpcId });
    new CfnOutput(this, "PublicSubnetIds", {
      value: this.publicSubnets.map((s) => s.subnetId).join(","),
    });
    new CfnOutput(this, "PrivateSubnetIds", {
      value: this.privateSubnets.map((s) => s.subnetId).join(","),
    });
  }
}
