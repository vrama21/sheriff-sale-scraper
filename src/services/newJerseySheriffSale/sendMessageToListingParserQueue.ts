import { SQS, SendMessageCommand } from '@aws-sdk/client-sqs';
import { SendMessageToListingParserQueueArgs } from '@types';

export const sendMessageToListingParserQueue = async (args: SendMessageToListingParserQueueArgs): Promise<void> => {
  const { NJ_SHERIFF_SALE_LISTING_PARSER_QUEUE_URL } = process.env;

  if (!NJ_SHERIFF_SALE_LISTING_PARSER_QUEUE_URL) {
    throw new Error('NJ_SHERIFF_SALE_LISTING_PARSER_QUEUE_URL is not defined');
  }

  const sqs = new SQS({ region: 'us-east-2' });

  const params = new SendMessageCommand({
    MessageBody: JSON.stringify({ ...args }),
    QueueUrl: NJ_SHERIFF_SALE_LISTING_PARSER_QUEUE_URL,
  }).input;

  console.log(`Sending message to listing parser queue with args: ${JSON.stringify(args, null, 2)}`);
  await sqs.sendMessage(params);
  console.log(`Successfully sent message to listing parser queue`);
};
