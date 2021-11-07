import * as cdk from '@aws-cdk/core';
import { Rule, Schedule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';

import { config } from 'dotenv';
import * as path from 'path'

config()

export class SheriffSaleScraperStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const newJerseySheriffSaleScraper = new NodejsFunction(this, 'NewJerseySheriffSaleScraper', {
      functionName: 'new-jersey-sheriff-sale-scraper',
      memorySize: 1024,
      timeout: cdk.Duration.minutes(15),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'main',
      entry: path.join(__dirname, '/../src/newJerseySheriffSaleScraper.ts')
    })

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
