declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NJ_SCRAPER_CONFIG_BUCKET_NAME: string;
    }
  }
}

export {};
