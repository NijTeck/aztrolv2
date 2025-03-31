import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from './authConfig';

const useAuth = () => {
  const { instance, accounts } = useMsal();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentAccount = instance.getActiveAccount();
    
    if (currentAccount) {
      setUser({
        username: currentAccount.username,
        name: currentAccount.name,
        id: currentAccount.localAccountId
      });
    }
    
    setLoading(false);
  }, [instance, accounts]);

  const login = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    try {
      await instance.logoutRedirect();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getToken = async () => {
    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: instance.getActiveAccount()
      });
      return response.accessToken;
    } catch (error) {
      console.error('Failed to get token silently, trying redirect:', error);
      instance.acquireTokenRedirect(loginRequest);
      return null;
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    getToken
  };
};

export default useAuth;
