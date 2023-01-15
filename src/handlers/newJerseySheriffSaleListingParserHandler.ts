import { SQSBatchItemFailure, SQSBatchResponse, SQSEvent } from 'aws-lambda';
import { SendMessageToListingParserQueueArgs } from '../types';
import { newJerseySheriffSaleListingParser } from '../controllers';

export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const batchItemFailures: SQSBatchItemFailure[] = [];

  await Promise.all(
    event.Records.map(async (record) => {
      try {
        const args = JSON.parse(record.body) as unknown as SendMessageToListingParserQueueArgs;

        console.log(`Received message with args: ${JSON.stringify(args, null, 2)}`);

        await newJerseySheriffSaleListingParser(args);
      } catch {
        console.error(`Error parsing message body: ${record.body}`);

        batchItemFailures.push({
          itemIdentifier: record.messageId,
        });
      }
    }),
  );

  return {
    batchItemFailures,
  };
};
