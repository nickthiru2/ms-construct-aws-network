import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { NetworkConstruct } from "../lib";

describe("NetworkConstruct", () => {
  let app: App;
  let stack: Stack;
  let template: Template;

  beforeAll(() => {
    // GIVEN
    app = new App();
    stack = new Stack(app, "TestStack", {
      env: { account: "123456789012", region: "us-east-1" },
    });

    // WHEN
    new NetworkConstruct(stack, "Network", {
      envName: "test",
      awsRegion: "us-east-1",
      vpcName: "test-vpc",
      clusterName: "test-cluster",
    });

    // THEN
    template = Template.fromStack(stack);
  });

  test("creates a VPC with the correct properties", () => {
    // THEN
    template.hasResourceProperties("AWS::EC2::VPC", {
      CidrBlock: "10.10.0.0/16",
      EnableDnsHostnames: true,
      EnableDnsSupport: true,
      Tags: [
        {
          Key: "Name",
          Value: "test-vpc",
        },
        {
          Key: "Environment",
          Value: "test",
        },
        {
          Key: "ManagedBy",
          Value: "CDK",
        },
        {
          Key: "Project",
          Value: "MicroservicesUpRunning",
        },
      ],
    });
  });

  test("creates public and private subnets", () => {
    // THEN
    template.resourceCountIs("AWS::EC2::Subnet", 4);

    // Check public subnets
    template.hasResourceProperties("AWS::EC2::Subnet", {
      CidrBlock: "10.10.0.0/18",
      MapPublicIpOnLaunch: true,
      Tags: [
        {
          Key: "Name",
          Value: "test-public-subnet-use1a",
        },
      ],
    });

    // Check private subnets
    template.hasResourceProperties("AWS::EC2::Subnet", {
      CidrBlock: "10.10.128.0/18",
      Tags: [
        {
          Key: "Name",
          Value: "test-private-subnet-use1a",
        },
      ],
    });
  });

  test("creates NAT gateways", () => {
    // THEN
    template.resourceCountIs("AWS::EC2::NatGateway", 2);
  });

  test("creates internet gateway", () => {
    // THEN
    template.resourceCountIs("AWS::EC2::InternetGateway", 1);
  });

  test("creates route tables", () => {
    // THEN
    template.resourceCountIs("AWS::EC2::RouteTable", 5); // 1 main + 2 public + 2 private
  });
});
