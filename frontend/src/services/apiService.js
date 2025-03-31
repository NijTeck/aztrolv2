// frontend/src/services/apiService.js
import { useState, useCallback } from 'react';
import useAuth from '../auth/useAuth';

const useApiService = () => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use your actual API URL here
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'https://your-function-app-url.azurewebsites.net';

  const fetchWithAuth = useCallback(async (url, options = {})  => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('Failed to acquire authentication token');
      }
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Network API methods
  const networkApi = {
    getNetworkTopology: async (subscriptionId) => {
      return fetchWithAuth(`${apiBaseUrl}/api/network/topology?subscriptionId=${subscriptionId}`);
    },
    
    getResourceDetails: async (resourceId) => {
      return fetchWithAuth(`${apiBaseUrl}/api/network/resource?resourceId=${resourceId}`);
    },
    
    // Other network API methods...
  };

  // Other API methods...

  return {
    loading,
    error,
    networkApi,
    // Other API objects...
  };
};

export default useApiService;
