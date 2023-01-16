import { SQSBatchItemFailure, SQSBatchResponse, SQSEvent } from 'aws-lambda';
import { SendMessageToListingParserQueueArgs } from '../types';
import { newJerseySheriffSaleListingParser } from '../controllers';

export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const batchItemFailures: SQSBatchItemFailure[] = [];

  await Promise.all(
    event.Records.map(async (record) => {
      try {
        const args = JSON.parse(record.body) as unknown as SendMessageToListingParserQueueArgs;

        await newJerseySheriffSaleListingParser(args);
      } catch (error) {
        console.error(`Error parsing messageId: ${record.messageId}:`, error);

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
