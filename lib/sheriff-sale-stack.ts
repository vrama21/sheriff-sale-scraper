import { config } from 'dotenv';
config();

import { Construct } from 'constructs';
import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as eventTargets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';

import { SheriffSaleHandler } from './constructs';

export class SheriffSaleStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const { AWS_ACCOUNT_ID, ENV, DATABASE_URL } = process.env;

    if (!AWS_ACCOUNT_ID) throw new Error('AWS_ACCOUNT_ID not set');
    if (!ENV) throw new Error('ENV not set');
    if (!DATABASE_URL) throw new Error('DATABASE_URL not set');

    const newJerseySheriffSaleBucket = new s3.Bucket(this, 'NewJerseySheriffSaleBucket', {
      bucketName: `nj-sheriff-sale-bucket-${ENV}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: ENV === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
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

    const newJerseySheriffSaleCountyParser = new SheriffSaleHandler(this, 'NewJerseySheriffSaleCountyParser', {
      deadLetterQueue: new sqs.Queue(this, 'NewJerseySheriffSaleCountyParserDLQ', {
        queueName: `new-jersey-sheriff-sale-county-parser-dlq-${ENV}`,
        retentionPeriod: Duration.days(14),
      }),
      entry: 'src/handlers/newJerseySheriffSaleCountyParserHandler.ts',
      environment: {
        DATABASE_URL,
        ENV,
        NJ_SHERIFF_SALE_BUCKET_NAME: newJerseySheriffSaleBucket.bucketName,
        NJ_SHERIFF_SALE_LISTING_PARSER_QUEUE_URL: newJerseySheriffSaleListingParserQueue.queueUrl,
      },
      functionName: `new-jersey-sheriff-sale-county-parser-${ENV}`,
      handler: 'handler',
      memorySize: 512,
      role: new iam.Role(this, 'NewJerseySheriffSaleCountyParserRole', {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        inlinePolicies: {
          NewJerseySheriffSaleCountyParserPolicy: new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['s3:GetObject', 's3:PutObject'],
                resources: [newJerseySheriffSaleBucket.arnForObjects('*')],
              }),
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['sqs:SendMessage'],
                resources: [newJerseySheriffSaleListingParserQueue.queueArn],
              }),
            ],
          }),
        },
        managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
        roleName: `new-jersey-sheriff-sale-county-parser-role-${ENV}`,
      }),
      timeout: Duration.minutes(15),
    });

    const newJerseySheriffSaleListingParser = new SheriffSaleHandler(
      this,
      'NewJerseySheriffSaleListingParser',
      {
        entry: 'src/handlers/newJerseySheriffSaleListingParserHandler.ts',
        environment: {
          DATABASE_URL,
          ENV,
          NJ_SHERIFF_SALE_BUCKET_NAME: newJerseySheriffSaleBucket.bucketName,
        },
        functionName: `new-jersey-sheriff-sale-listing-parser-${ENV}`,
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
                new iam.PolicyStatement({
                  effect: iam.Effect.ALLOW,
                  actions: ['sqs:ReceiveMessage', 'sqs:DeleteMessage'],
                  resources: [newJerseySheriffSaleListingParserQueue.queueArn],
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

    new events.Rule(this, 'NewJerseySheriffSaleCountyParserRule', {
      description: 'New Jersey Sheriff Sale County Parser Cron Rule to run at 12:00AM UTC.',
      ruleName: `new-jersey-sheriff-sale-county-parser-rule-${ENV}`,
      schedule: events.Schedule.cron({
        year: '*',
        month: '*',
        day: '*',
        hour: '0',
        minute: '0',
      }),
      targets: [new eventTargets.LambdaFunction(newJerseySheriffSaleCountyParser)],
    });
  }
}
