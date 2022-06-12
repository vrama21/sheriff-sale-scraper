import { Construct } from 'constructs';
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { config } from 'dotenv';
import * as path from 'path';

export class SheriffSaleScraperStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    config();

    const { NJ_SCRAPER_CONFIG_BUCKET_NAME } = process.env;

    if (!NJ_SCRAPER_CONFIG_BUCKET_NAME) throw new Error('NJ_SCRAPER_CONFIG_BUCKET_NAME not set');

    const newJerseySheriffSaleScraper = new NodejsFunction(this, 'NewJerseySheriffSaleScraper', {
      entry: path.join(__dirname, '/../src/newJerseySheriffSaleScraper.ts'),
      environment: {
        NJ_SCRAPER_CONFIG_BUCKET_NAME,
      },
      functionName: 'new-jersey-sheriff-sale-scraper',
      handler: 'main',
      memorySize: 1024,
      runtime: Runtime.NODEJS_12_X,
      timeout: Duration.minutes(15),
    });

    new Rule(this, 'NewJerseySheriffSaleScraperFunctionRule', {
      description: 'New Jersey Sheriff Sale Scraper Function Cron Rule to run every day.',
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
