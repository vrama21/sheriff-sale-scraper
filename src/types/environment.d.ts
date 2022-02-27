declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_HOST: string | undefined;
      DB_NAME: string | undefined;
      DB_PASSWORD: string | undefined;
      DB_USER: string | undefined;
      NJ_SCRAPER_CONFIG_BUCKET_NAME: string | undefined;
    }
  }
}

export {};
