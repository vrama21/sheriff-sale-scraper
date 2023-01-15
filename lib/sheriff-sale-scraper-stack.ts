import { config } from 'dotenv';
config();

import { Construct } from 'constructs';
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as eventTargets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
// import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as path from 'path';

export class SheriffSaleScraperStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const { AWS_ACCOUNT_ID, ENV, DATABASE_URL } = process.env;

    if (!AWS_ACCOUNT_ID) throw new Error('AWS_ACCOUNT_ID not set');
    if (!ENV) throw new Error('ENV not set');
    if (!DATABASE_URL) throw new Error('DATABASE_URL not set');

    // const vpc = new ec2.Vpc(this, 'SheriffSaleVPC', {
    //   cidr: '10.0.0.0/16',
    //   maxAzs: 3,
    //   natGateways: ENV === 'prod' ? 2 : 1,
    //   subnetConfiguration: [
    //     {
    //       name: 'sheriff-sale-private-subnet',
    //       subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
    //       cidrMask: 24,
    //     },
    //     {
    //       name: 'sheriff-sale-public-subnet',
    //       subnetType: ec2.SubnetType.PUBLIC,
    //       cidrMask: 24,
    //     },
    //   ],
    // });

    // const newJerseySheriffSaleSecurityGroup = new ec2.SecurityGroup(this, 'NewJerseySheriffSaleSecurityGroup', {
    //   allowAllOutbound: true,
    //   description: 'Security group for New Jersey Sheriff Sale Scraper',
    //   securityGroupName: 'new-jersey-sheriff-sale-security-group',
    //   vpc,
    // });

    // newJerseySheriffSaleSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS traffic');
    // newJerseySheriffSaleSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP traffic');

    const newJerseySheriffSaleBucket = new s3.Bucket(this, 'NewJerseySheriffSaleBucket', {
      bucketName: `nj-sheriff-sale-bucket-${ENV}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    const newJerseySheriffSaleListingParserDLQ = new sqs.Queue(this, 'NewJerseySheriffSaleListingParserDLQ', {
      queueName: `nj-sheriff-sale-listing-parser-dlq-${ENV}`,
      retentionPeriod: Duration.days(14),
    });

    const newJerseySheriffSaleListingParserQueue = new sqs.Queue(this, 'NewJerseySheriffSaleListingParserQueue', {
      deadLetterQueue: {
        maxReceiveCount: 3,
        queue: newJerseySheriffSaleListingParserDLQ,
      },
      queueName: `nj-sheriff-sale-listing-parser-queue-${ENV}`,
      visibilityTimeout: Duration.minutes(15),
    });

    const newJerseySheriffSaleScraper = new lambdaNodeJs.NodejsFunction(this, 'NewJerseySheriffSaleScraper', {
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
              `npx prisma generate`,
              `rm -rf node_modules/@prisma/engines`,
              `rm -rf node_modules/@prisma/client/node_modules node_modules/.bin node_modules/prisma`,
            ];
          },
        },
        nodeModules: ['@prisma/client', 'prisma'],
      },
      deadLetterQueue: new sqs.Queue(this, 'NewJerseySheriffSaleScraperDLQ', {
        queueName: `new-jersey-sheriff-sale-scraper-dlq-${ENV}`,
        retentionPeriod: Duration.days(14),
      }),
      entry: path.join(__dirname, '/../src/handlers/newJerseySheriffSaleScraperHandler.ts'),
      environment: {
        DATABASE_URL,
        ENV,
        NJ_SHERIFF_SALE_BUCKET_NAME: newJerseySheriffSaleBucket.bucketName,
        NJ_SHERIFF_SALE_LISTING_PARSER_QUEUE_URL: newJerseySheriffSaleListingParserQueue.queueUrl,
      },
      functionName: `new-jersey-sheriff-sale-scraper-${ENV}`,
      handler: 'handler',
      memorySize: 1024,
      role: new iam.Role(this, 'NewJerseySheriffSaleScraperRole', {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        inlinePolicies: {
          NewJerseySheriffSaleScraperPolicy: new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['s3:GetObject', 's3:PutObject'],
                resources: [newJerseySheriffSaleBucket.arnForObjects('*')],
              }),
            ],
          }),
        },
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
          // iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
        ],
        roleName: `new-jersey-sheriff-sale-scraper-role-${ENV}`,
      }),
      runtime: lambda.Runtime.NODEJS_16_X,
      // securityGroups: [newJerseySheriffSaleSecurityGroup],
      timeout: Duration.minutes(15),
      // vpc,
      // vpcSubnets: {
      //   subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      // },
    });

    const newJerseySheriffSaleListingParser = new lambdaNodeJs.NodejsFunction(
      this,
      'NewJerseySheriffSaleListingParser',
      {
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
                `npx prisma generate`,
                `rm -rf node_modules/@prisma/engines`,
                `rm -rf node_modules/@prisma/client/node_modules node_modules/.bin node_modules/prisma`,
              ];
            },
          },
          nodeModules: ['@prisma/client', 'prisma'],
        },
        entry: path.join(__dirname, '/../src/handlers/newJerseySheriffSaleListingParserHandler.ts'),
        environment: {
          DATABASE_URL,
          ENV,
          NJ_SHERIFF_SALE_BUCKET_NAME: newJerseySheriffSaleBucket.bucketName,
        },
        functionName: `new-jersey-sheriff-sale-listing-parser-${ENV}`,
        handler: 'handler',
        memorySize: 1024,
        role: new iam.Role(this, 'NewJerseySheriffSaleListingParserRole', {
          assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
          inlinePolicies: {
            NewJerseySheriffSaleListingParserPolicy: new iam.PolicyDocument({
              statements: [
                new iam.PolicyStatement({
                  effect: iam.Effect.ALLOW,
                  actions: ['s3:GetObject', 's3:PutObject'],
                  resources: [newJerseySheriffSaleBucket.arnForObjects('*')],
                }),
              ],
            }),
          },
          managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
          roleName: `new-jersey-sheriff-sale-listing-parser-role-${ENV}`,
        }),
        runtime: lambda.Runtime.NODEJS_16_X,
        timeout: Duration.minutes(15),
      },
    );

    newJerseySheriffSaleListingParser.addEventSource(
      new lambdaEventSources.SqsEventSource(newJerseySheriffSaleListingParserQueue, {
        batchSize: 10,
        reportBatchItemFailures: true,
      }),
    );

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
  }
}
