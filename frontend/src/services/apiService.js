import { useState, useCallback } from 'react';
import useAuth from '../auth/useAuth';

const useApiService = () => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiBaseUrl = process.env.REACT_APP_API_URL || 'https://aztrol-functions.azurewebsites.net';

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
        throw new Error(`API request failed with status ${response.status}`);
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
    
    verifyIpFlow: async (params) => {
      return fetchWithAuth(`${apiBaseUrl}/api/network/ipflow`, {
        method: 'POST',
        body: JSON.stringify(params)
      });
    },
    
    getNextHop: async (params) => {
      return fetchWithAuth(`${apiBaseUrl}/api/network/nexthop`, {
        method: 'POST',
        body: JSON.stringify(params)
      });
    }
  };

  // Permission API methods
  const permissionApi = {
    getRoleAssignments: async (scope) => {
      return fetchWithAuth(`${apiBaseUrl}/api/permissions/assignments?scope=${scope}`);
    },
    
    getEffectivePermissions: async (principalId, scope) => {
      return fetchWithAuth(`${apiBaseUrl}/api/permissions/effective?principalId=${principalId}&scope=${scope}`);
    },
    
    getRoleDefinitions: async (subscriptionId) => {
      return fetchWithAuth(`${apiBaseUrl}/api/permissions/roles?subscriptionId=${subscriptionId}`);
    }
  };

  // Cost API methods
  const costApi = {
    getCosts: async (subscriptionId) => {
      return fetchWithAuth(`${apiBaseUrl}/api/cost/overview?subscriptionId=${subscriptionId}`);
    },
    
    getCostBreakdown: async (subscriptionId, timeframe) => {
      return fetchWithAuth(`${apiBaseUrl}/api/cost/breakdown?subscriptionId=${subscriptionId}&timeframe=${timeframe}`);
    },
    
    getCostTrend: async (subscriptionId, period) => {
      return fetchWithAuth(`${apiBaseUrl}/api/cost/trend?subscriptionId=${subscriptionId}&period=${period}`);
    }
  };

  return {
    loading,
    error,
    networkApi,
    permissionApi,
    costApi
  };
};

export default useApiService;




// import React from 'react';
// import axios from 'axios';
// import { useAuth } from '../auth/useAuth';

// /**
//  * API service for making authenticated requests to the backend
//  */
// const useApiService = () => {
//   const { getToken } = useAuth();
  
//   /**
//    * Make an authenticated API request
//    * @param {string} endpoint - API endpoint
//    * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
//    * @param {object} data - Request payload for POST/PUT requests
//    * @returns {Promise} - Promise with API response
//    */
//   const apiRequest = async (endpoint, method = 'GET', data = null) => {
//     try {
//       const token = await getToken();
      
//       if (!token) {
//         throw new Error('Authentication token not available');
//       }
      
//       const config = {
//         method,
//         url: `/api${endpoint}`,
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         data: data ? JSON.stringify(data) : undefined
//       };
      
//       const response = await axios(config);
//       return response.data;
//     } catch (error) {
//       console.error(`API request failed: ${error.message}`);
//       throw error;
//     }
//   };
  
//   // Network API endpoints
//   const networkApi = {
//     getTopology: (subscriptionId) => 
//       apiRequest(`/network/topology?subscriptionId=${subscriptionId}`),
    
//     getResourceDetails: (resourceId) => 
//       apiRequest(`/network/resources/${resourceId}`),
    
//     verifyIpFlow: (params) => 
//       apiRequest('/network/troubleshoot/ipflow', 'POST', params),
    
//     getNextHop: (params) => 
//       apiRequest('/network/troubleshoot/nexthop', 'POST', params)
//   };
  
//   // Permissions API endpoints
//   const permissionsApi = {
//     getRoleAssignments: (scope) => 
//       apiRequest(`/permissions/roleassignments?scope=${scope}`),
    
//     getEffectivePermissions: (principalId, resourceId) => 
//       apiRequest(`/permissions/effectivepermissions?principalId=${principalId}&resourceId=${resourceId}`),
    
//     getRoleDefinitions: () => 
//       apiRequest('/permissions/roledefinitions')
//   };
  
//   // Cost API endpoints
//   const costApi = {
//     getCurrentMonthCost: (subscriptionId) => 
//       apiRequest(`/cost/currentmonth?subscriptionId=${subscriptionId}`),
    
//     getCostBreakdown: (subscriptionId, timeframe) => 
//       apiRequest(`/cost/breakdown?subscriptionId=${subscriptionId}&timeframe=${timeframe}`),
    
//     getCostTrend: (subscriptionId, period) => 
//       apiRequest(`/cost/trend?subscriptionId=${subscriptionId}&period=${period}`)
//   };
  
//   // Policy API endpoints
//   const policyApi = {
//     getPolicyCompliance: (subscriptionId) => 
//       apiRequest(`/policy/compliance?subscriptionId=${subscriptionId}`),
    
//     getPolicyAssignments: (subscriptionId) => 
//       apiRequest(`/policy/assignments?subscriptionId=${subscriptionId}`),
    
//     getPolicyDetails: (policyId) => 
//       apiRequest(`/policy/details/${policyId}`)
//   };
  
//   return {
//     networkApi,
//     permissionsApi,
//     costApi,
//     policyApi
//   };
// };

// export default useApiService;
