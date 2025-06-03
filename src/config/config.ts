interface Config {
  environment: string;
  isProduction: boolean;
  isDevelopment: boolean;
  apiUrl?: string;
  googleClientId?: string;
}
export const config: Config = {
  environment: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  apiUrl: import.meta.env.VITE_API_URL,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
};
