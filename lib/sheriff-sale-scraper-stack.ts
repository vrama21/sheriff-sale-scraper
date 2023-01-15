import { config } from 'dotenv';
config();

import { Construct } from 'constructs';
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as eventTargets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';

import * as path from 'path';

export class SheriffSaleScraperStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const { AWS_ACCOUNT_ID, ENV, DATABASE_URL } = process.env;

    if (!AWS_ACCOUNT_ID) throw new Error('AWS_ACCOUNT_ID not set');
    if (!ENV) throw new Error('ENV not set');
    if (!DATABASE_URL) throw new Error('DATABASE_URL not set');

    const vpc = new ec2.Vpc(this, 'TabapayIntegrationVPC', {
      cidr: '10.0.0.0/16',
      natGateways: ENV === 'prod' ? 3 : 1,
      maxAzs: 3,
      subnetConfiguration: [
        {
          name: 'tabapay-integration-private-subnet',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: 'tabapay-integration-public-subnet',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    });

    const newJerseySheriffSaleScraperBucket = new s3.Bucket(this, 'NewJerseySheriffSaleScraperBucket', {
      bucketName: `nj-sheriff-sale-scraper-bucket-${ENV}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    const newJerseySheriffSaleScraper = new lambdaNodeJs.NodejsFunction(this, 'NewJerseySheriffSaleScraper', {
      allowAllOutbound: true,
      bundling: {
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
        nodeModules: ['@prisma/client', 'prisma'],
      },
      entry: path.join(__dirname, '/../src/handlers/newJerseySheriffSaleScraper.ts'),
      environment: {
        DATABASE_URL,
        ENV,
        NJ_SCRAPER_BUCKET_NAME: newJerseySheriffSaleScraperBucket.bucketName,
      },
      functionName: `new-jersey-sheriff-sale-scraper-${ENV}`,
      handler: 'handler',
      memorySize: 1024,
      runtime: lambda.Runtime.NODEJS_16_X,
      timeout: Duration.minutes(15),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    new events.Rule(this, 'NewJerseySheriffSaleScraperFunctionRule', {
      description: 'New Jersey Sheriff Sale Scraper Function Cron Rule to run at 12:00AM UTC.',
      ruleName: `new-jersey-sheriff-sale-scraper-function-rule-${ENV}`,
      schedule: events.Schedule.cron({
        year: '*',
        month: '*',
        day: '*',
        hour: '0',
        minute: '0',
      }),
      targets: [new eventTargets.LambdaFunction(newJerseySheriffSaleScraper)],
    });

    const policies = [
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['s3:GetObject', 's3:PutObject'],
        resources: ['*'],
      }),
    ];

    policies.forEach((statement) => {
      newJerseySheriffSaleScraper.addToRolePolicy(statement);
    });
  }
}
