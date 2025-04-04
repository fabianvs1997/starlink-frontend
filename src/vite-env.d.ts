/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_AUTH_API_URL: string;
  readonly VITE_RECAPTCHA_SITE_KEY: string;
  readonly VITE_TOKEN_STORAGE_KEY: string;
  readonly VITE_MAX_LOGIN_ATTEMPTS: string;
  readonly VITE_LOGIN_COOLDOWN_MINUTES: string;
  readonly VITE_DEBUG_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}/// <reference types="vite/client" />
