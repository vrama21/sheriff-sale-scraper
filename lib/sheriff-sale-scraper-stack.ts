import { Construct } from 'constructs';
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { config } from 'dotenv';
import * as path from 'path';

export class SheriffSaleScraperStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    config();

    const { DATABASE_URL, NJ_SCRAPER_CONFIG_BUCKET_NAME } = process.env;

    if (!DATABASE_URL) throw new Error('DATABASE_URL not set');
    if (!NJ_SCRAPER_CONFIG_BUCKET_NAME) throw new Error('NJ_SCRAPER_CONFIG_BUCKET_NAME not set');

    const vpc = new ec2.Vpc(this, 'sheriff-sale-vpc', {
      cidr: '10.40.0.0/16',
      natGateways: 1,
      maxAzs: 2,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          name: 'sheriff-sale-public-subnet',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'sheriff-sale-private-subnet',
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
          cidrMask: 24,
        },
        {
          name: 'sheriff-sale-isolated-subnet',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ] as ec2.SubnetConfiguration[],
    });

    const lambdaProxySecurityGroup = new ec2.SecurityGroup(this, `nj-scraper-proxy-security-group`, {
      allowAllOutbound: true,
      description: 'Lambda to RDS Proxy Connection',
      vpc,
    });

    const newJerseySheriffSaleScraperRole = new iam.Role(this, 'NewJerseySheriffSaleScraperRole', {
      roleName: 'new-jersey-sheriff-sale-scraper-role',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole')],
      inlinePolicies: {
        S3Policy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:GetObject', 's3:PutObject'],
              resources: ['*'],
            }),
          ],
        }),
      },
    });

    const newJerseySheriffSaleScraper = new NodejsFunction(this, 'NewJerseySheriffSaleScraper', {
      bundling: {
        nodeModules: ['@prisma/client', 'prisma'],
        commandHooks: {
          beforeBundling(_inputDir: string, _outputDir: string) {
            return [];
          },
          beforeInstall(inputDir: string, outputDir: string) {
            return [`cp -R ${inputDir}/prisma ${outputDir}/`];
          },
          afterBundling(_inputDir: string, outputDir: string) {
            return [
              `cd ${outputDir}`,
              `yarn prisma generate`,
              `rm -rf node_modules/@prisma/engines`,
              `rm -rf node_modules/@prisma/client/node_modules node_modules/.bin node_modules/prisma`,
            ];
          },
        },
      },
      entry: path.join(__dirname, '/../src/newJerseySheriffSaleScraper.ts'),
      environment: {
        DATABASE_URL,
        NJ_SCRAPER_CONFIG_BUCKET_NAME,
      },
      functionName: 'new-jersey-sheriff-sale-scraper',
      handler: 'main',
      memorySize: 1024,
      role: newJerseySheriffSaleScraperRole,
      runtime: Runtime.NODEJS_14_X,
      timeout: Duration.minutes(15),
      securityGroups: [lambdaProxySecurityGroup],
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_NAT } as ec2.SubnetSelection,
    });

    new Rule(this, 'NewJerseySheriffSaleScraperFunctionRule', {
      description: 'New Jersey Sheriff Sale Scraper Function Cron Rule to run at 12:00AM UTC.',
      ruleName: 'new-jersey-sheriff-sale-scraper-function-rule',
      schedule: Schedule.cron({
        year: '*',
        month: '*',
        day: '*',
        hour: '0',
        minute: '0',
      }),
      targets: [new LambdaFunction(newJerseySheriffSaleScraper)],
    });
  }
}
