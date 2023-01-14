declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string | undefined;
      NJ_SCRAPER_BUCKET_NAME: string | undefined;
    }
  }
}

export {};
