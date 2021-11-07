import { APIGatewayProxyEvent, APIGatewayProxyResultV2 } from 'aws-lambda';
import { runNewJerseySheriffSaleScraper } from './controllers';

export async function main(_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> {
  try {
    await runNewJerseySheriffSaleScraper();
  } catch (err) {
    const error = err as Error;
    console.error(error);

    return {
      body: JSON.stringify({ message: error.message }),
      statusCode: 500,
    };
  }

  return {
    body: JSON.stringify({
      message: 'New Jersey Sheriff Sale Scraper ran successfully.',
    }),
    statusCode: 200,
  };
}
