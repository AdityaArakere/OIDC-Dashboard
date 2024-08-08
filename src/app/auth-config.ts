import { Configuration, BrowserCacheLocation } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: '0fcc918a-31ab-4540-ad34-68a02fd76cba',
    authority: `https://login.microsoftonline.com/649f5ce3-71a6-4867-bec0-9eda9937a359`,
    redirectUri: 'https://admintool.v5dev.brandmuscle.net/app/oidc-dashboard/v1/',
    postLogoutRedirectUri: 'https://admintool.v5dev.brandmuscle.net/app/oidc-dashboard/v1/',
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
  },
};
