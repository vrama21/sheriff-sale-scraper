import { config } from 'dotenv';
config();

import { Construct } from 'constructs';
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import * as path from 'path';

export class SheriffSaleScraperStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const { DATABASE_URL, NJ_SCRAPER_CONFIG_BUCKET_NAME } = process.env;

    if (!DATABASE_URL) throw new Error('DATABASE_URL not set');
    if (!NJ_SCRAPER_CONFIG_BUCKET_NAME) throw new Error('NJ_SCRAPER_CONFIG_BUCKET_NAME not set');

    const newJerseySheriffSaleScraper = new NodejsFunction(this, 'NewJerseySheriffSaleScraper', {
      entry: path.join(__dirname, '/../src/newJerseySheriffSaleScraper.ts'),
      environment: {
        DATABASE_URL,
        NJ_SCRAPER_CONFIG_BUCKET_NAME,
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
