# AWS Network Construct

A reusable CDK construct that provisions AWS networking resources following best practices for microservices architectures. This construct creates a VPC with public and private subnets across multiple availability zones, along with necessary routing and security configurations.

## Features

- Creates a VPC with public and private subnets
- Configures NAT gateways for outbound internet access from private subnets
- Sets up route tables and internet gateway
- Tags resources appropriately for cost allocation and Kubernetes integration
- Exports VPC and subnet IDs for use by other stacks

## Prerequisites

- Node.js 16+ and npm 8+
- AWS CDK v2.x
- AWS CLI configured with appropriate credentials
- Access to AWS CodeArtifact repository

## Installation

### Local Development

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

### From CodeArtifact

1. Authenticate with CodeArtifact:
   ```bash
   aws codeartifact login --tool npm \
     --domain ms \
     --domain-owner YOUR_ACCOUNT_ID \
     --repository network-construct \
     --region us-east-1
   ```

2. Install the package:
   ```bash
   npm install @ms/network-construct
   ```

## Usage

```typescript
import { NetworkConstruct } from '@ms/network-construct';

// In your stack
const network = new NetworkConstruct(this, 'Network', {
  envName: 'sandbox',
  awsRegion: 'us-east-1',
  vpcName: 'my-vpc',
  clusterName: 'my-eks-cluster',
  mainVpcCidr: '10.10.0.0/16',
  publicSubnetACidr: '10.10.0.0/18',
  publicSubnetBCidr: '10.10.64.0/18',
  privateSubnetACidr: '10.10.128.0/18',
  privateSubnetBCidr: '10.10.192.0/18'
});

// Access the VPC and subnets
const vpc = network.vpc;
const publicSubnets = network.publicSubnets;
const privateSubnets = network.privateSubnets;
```

## Configuration

### Required Properties

- `envName`: Environment name (e.g., 'sandbox', 'staging', 'prod')
- `awsRegion`: AWS region where resources will be created
- `vpcName`: Name for the VPC
- `clusterName`: Name of the EKS cluster (for tagging)

### Optional Properties

- `mainVpcCidr`: VPC CIDR block (default: '10.10.0.0/16')
- `publicSubnetACidr`: CIDR for first public subnet (default: '10.10.0.0/18')
- `publicSubnetBCidr`: CIDR for second public subnet (default: '10.10.64.0/18')
- `privateSubnetACidr`: CIDR for first private subnet (default: '10.10.128.0/18')
- `privateSubnetBCidr`: CIDR for second private subnet (default: '10.10.192.0/18')

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Watching for Changes

```bash
npm run watch
```

## Publishing

1. Update the version in `package.json`
2. Build the package:
   ```bash
   npm run build
   ```
3. Publish to CodeArtifact:
   ```bash
   npm publish
   ```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Publish

on:
  push:
    branches: [ main ]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Configure AWS Credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Login to CodeArtifact
      run: |
        aws codeartifact login --tool npm \
          --domain ms \
          --domain-owner ${{ secrets.AWS_ACCOUNT_ID }} \
          --repository network-construct \
          --region us-east-1
    
    - name: Build and Publish
      run: |
        npm run build
        npm publish
```

## Security

- All resources are tagged with the environment name
- IAM policies should follow the principle of least privilege
- Enable VPC flow logs for network traffic monitoring

## Troubleshooting

### Common Issues

1. **Deployment Fails**
   - Verify IAM permissions
   - Check if VPC CIDR range conflicts with existing networks
   - Ensure NAT Gateway service limits are not exceeded

2. **Cannot Resolve Package**
   - Verify CodeArtifact authentication
   - Check repository URL in `publishConfig`
   - Ensure package version is incremented for new publishes

## License

[Specify License]

## Contributing

[Contribution guidelines]
