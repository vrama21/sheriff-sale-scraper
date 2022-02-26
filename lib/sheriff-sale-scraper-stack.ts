import { Construct, Duration, Stack, StackProps } from '@aws-cdk/core';
import { Rule, Schedule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';

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
      description: 'NewJerseySheriffSaleScraperFunction Cron Rule to run every day.',
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
