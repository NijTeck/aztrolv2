import React, { useState } from 'react';
import useApiService from '../services/apiService';

/**
 * Effective Permissions Component
 * Analyzes effective permissions for a principal on a resource
 */
const EffectivePermissions = () => {
  const { permissionsApi } = useApiService();
  const [formData, setFormData] = useState({
    principalId: '',
    resourceId: ''
  });
  const [effectivePermissions, setEffectivePermissions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);
    setEffectivePermissions(null);
    
    try {
      const result = await permissionsApi.getEffectivePermissions(
        formData.principalId,
        formData.resourceId
      );
      setEffectivePermissions(result);
    } catch (error) {
      console.error('Error getting effective permissions:', error);
      setError('Failed to get effective permissions. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="effective-permissions-container">
      <h3>Effective Permissions</h3>
      <p>Analyze effective permissions for a principal on a resource</p>
      
      <form onSubmit={handleSubmit} className="permissions-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="principalId">Principal ID:</label>
            <input
              type="text"
              id="principalId"
              name="principalId"
              value={formData.principalId}
              onChange={handleChange}
              placeholder="Enter Azure AD Object ID"
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="resourceId">Resource ID:</label>
            <input
              type="text"
              id="resourceId"
              name="resourceId"
              value={formData.resourceId}
              onChange={handleChange}
              placeholder="Enter Azure Resource ID"
              required
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Permissions'}
          </button>
        </div>
      </form>
      
      {loading && <div className="loading-indicator">Analyzing permissions...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {effectivePermissions && (
        <div className="results-container">
          <h4>Role Assignments</h4>
          {effectivePermissions.roleAssignments.length === 0 ? (
            <p>No role assignments found for this principal on this resource.</p>
          ) : (
            <ul className="role-list">
              {effectivePermissions.roleAssignments.map((role, index) => (
                <li key={index}>
                  <strong>{role.roleName}</strong>
                  {role.inherited && <span className="inherited-badge">Inherited</span>}
                  <div className="scope-info">Scope: {formatScope(role.scope)}</div>
                </li>
              ))}
            </ul>
          )}
          
          <h4>Effective Permissions</h4>
          {effectivePermissions.effectivePermissions.length === 0 ? (
            <p>No permissions found for this principal on this resource.</p>
          ) : (
            <div className="permissions-list">
              {effectivePermissions.effectivePermissions.map((permission, index) => (
                <div key={index} className="permission-item">
                  {permission}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Format scope for display
 * @param {string} scope - Azure resource scope
 * @returns {string} - Formatted scope
 */
const formatScope = (scope) => {
  // Extract the last part of the scope for display
  const parts = scope.split('/');
  if (parts.length >= 4) {
    return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
  }
  return scope;
};

export default EffectivePermissions;
