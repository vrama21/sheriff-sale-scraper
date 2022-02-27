import { getClient } from './services/db';

const main = async () => {
  const dbClient = await getClient();

  console.log(dbClient)
  console.log(await dbClient.query('SELECT *'));
};

void main();
