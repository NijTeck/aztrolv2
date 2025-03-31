import React from 'react';
import useAuth from '../auth/useAuth';

const LoginPage = () => {
  const { login } = useAuth();

  return (
    <div className="login-container">
      <h1 className="login-title">Azure Enterprise Manager</h1>
      <p className="login-description">
        A comprehensive tool for managing Azure resources, including network visualization, 
        permissions management, and cost analysis.
      </p>
      <button className="login-button" onClick={login}>
        Sign in with Azure AD
      </button>
    </div>
  );
};

export default LoginPage;
