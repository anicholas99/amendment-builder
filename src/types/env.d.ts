/// <reference types="node" />

declare global {
  interface ImportMeta {
    url: string;
    env: {
      MODE: string;
      BASE_URL: string;
      PROD: boolean;
      DEV: boolean;
      SSR: boolean;
    };
  }
}

export {};
