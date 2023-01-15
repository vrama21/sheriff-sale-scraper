declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string | undefined;
      ENV: 'main' | 'prod' | undefined;
      NJ_SCRAPER_BUCKET_NAME: string | undefined;
    }
  }
}

export {};
