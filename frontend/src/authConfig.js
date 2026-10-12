import { PublicClientApplication } from '@azure/msal-browser';

// Microsoft Entra ID (Azure AD) SSO Configuration for Amlak Finance
export const msalConfig = {
  auth: {
    clientId: 'a7bfd8d0-ddff-4fd4-9f94-7e8dbe8ea6c1',
    authority: 'https://login.microsoftonline.com/common', // Supports All Microsoft account users (Work + Personal)
    redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
    postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

// Scopes required for Microsoft SSO login
export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
};

// Singleton MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);
