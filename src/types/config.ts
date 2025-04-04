export interface ConfiguracionAplicacion {
  apiBaseUrl: string;
  authApiUrl: string;
  recaptchaSiteKey: string;
  tokenStorageKey: string;
  maxLoginAttempts: number;
  loginCooldownMinutes: number;
  debugMode: boolean;
}

export const obtenerConfiguracion = (): ConfiguracionAplicacion => ({
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  authApiUrl: import.meta.env.VITE_AUTH_API_URL,
  recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
  tokenStorageKey: import.meta.env.VITE_TOKEN_STORAGE_KEY || 'authToken',
  maxLoginAttempts: Number(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS) || 5,
  loginCooldownMinutes: Number(import.meta.env.VITE_LOGIN_COOLDOWN_MINUTES) || 15,
  debugMode: import.meta.env.VITE_DEBUG_MODE === 'true'
});