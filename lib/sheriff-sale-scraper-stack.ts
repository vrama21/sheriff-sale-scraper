import { config } from 'dotenv';
config();

import { Construct } from 'constructs';
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as s3 from 'aws-cdk-lib/aws-s3';

import * as path from 'path';

export class SheriffSaleScraperStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const { AWS_ACCOUNT_ID, DATABASE_URL } = process.env;

    if (!AWS_ACCOUNT_ID) throw new Error('AWS_ACCOUNT_ID not set');
    if (!DATABASE_URL) throw new Error('DATABASE_URL not set');

    const newJerseySheriffSaleScraperBucket = new s3.Bucket(this, 'NewJerseySheriffSaleScraperBucket', {
      // blockPublicAccess: s3.BlockPublicAccess.,
      bucketName: 'nj-sheriff-sale-scraper-bucket',
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // newJerseySheriffSaleScraperBucket.addToResourcePolicy(
    //   new iam.PolicyStatement({
    //     actions: ['s3:GetObject', 's3:PutObject'],
    //     resources: [newJerseySheriffSaleScraperBucket.bucketArn, `${newJerseySheriffSaleScraperBucket.bucketArn}/*`],
    //     principals: [new iam.AccountPrincipal(AWS_ACCOUNT_ID)],
    //   }),
    // );

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
        NJ_SCRAPER_BUCKET_NAME: newJerseySheriffSaleScraperBucket.bucketName,
      },
      functionName: 'new-jersey-sheriff-sale-scraper',
      handler: 'main',
      memorySize: 1024,
      runtime: Runtime.NODEJS_14_X,
      timeout: Duration.minutes(15),
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
