const ENVIRONMENT = process.env.EXPO_PUBLIC_ENVIRONMENT;

export const API_URL =
  ENVIRONMENT === 'prod'
    ? process.env.EXPO_PUBLIC_PROD_API_URL
    : process.env.EXPO_PUBLIC_DEV_API_URL;
