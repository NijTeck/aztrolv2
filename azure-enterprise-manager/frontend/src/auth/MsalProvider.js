import React from 'react';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { MsalProvider as MsalReactProvider } from '@azure/msal-react';
import { msalConfig } from './authConfig';

export const msalInstance = new PublicClientApplication(msalConfig) ;

// Account selection logic is app dependent. Adjust as needed for different use cases.
const accounts = msalInstance.getAllAccounts();
if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
}

msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const account = event.payload.account;
    msalInstance.setActiveAccount(account);
  }
});

const MsalProvider = ({ children }) => {
  return (
    <MsalReactProvider instance={msalInstance}>
      {children}
    </MsalReactProvider>
  );
};

export default MsalProvider;
