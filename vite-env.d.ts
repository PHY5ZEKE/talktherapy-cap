/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_BACKEND_PORT: string;
  readonly VITE_FRONTEND_PORT: string;
  readonly VITE_API_PORT: string;
  readonly VITE_WS_PORT: string;
  readonly VITE_DB_CONNECTION: string;
  readonly VITE_JWT_SECRET: string;
  readonly VITE_JWT_EXPIRES_IN: string;
  readonly VITE_JWT_REFRESH_SECRET: string;
  readonly VITE_JWT_REFRESH_EXPIRES_IN: string;
  readonly VITE_NODE_ENV: string;
  readonly VITE_ALLOWED_ORIGINS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
