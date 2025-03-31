// Authentication configuration for Azure AD
export const msalConfig = {
    auth: {
      clientId: "dd0bb050-7cde-40de-b065-d9225ca4497e",
      authority: "https://login.microsoftonline.com/c02e07f8-5785-4da1-b596-208d85c97500",
      redirectUri: "https://aztrol.purplecliff-47739561.eastus2.azurecontainerapps.io",
      postLogoutRedirectUri: "https://aztrol.purplecliff-47739561.eastus2.azurecontainerapps.io",
    },
    cache: {
      cacheLocation: "sessionStorage",
      storeAuthStateInCookie: false,
    },
  };
  
  // Add scopes for API access
  export const loginRequest = {
    scopes: ["User.Read"]
  };
  
  // Add scopes for additional API access as needed
  export const tokenRequest = {
    scopes: ["User.Read", "https://management.azure.com/user_impersonation"]
  };
  
  // Authentication roles
  export const appRoles = {
    ADMIN: "Admin",
    VIEWER: "Viewer"
  };
  