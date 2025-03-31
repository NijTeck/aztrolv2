import React, { useState, useEffect } from 'react';
import useApiService from '../services/apiService';

/**
 * Role Definitions Component
 * Displays Azure role definitions and their permissions
 */
const RoleDefinitions = () => {
  const { permissionsApi } = useApiService();
  const [subscriptionId, setSubscriptionId] = useState('');
  const [roleDefinitions, setRoleDefinitions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch role definitions when subscription ID is provided
  useEffect(() => {
    const fetchRoleDefinitions = async () => {
      if (!subscriptionId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const definitions = await permissionsApi.getRoleDefinitions(subscriptionId);
        setRoleDefinitions(definitions);
        
        // Clear selected role when definitions change
        setSelectedRole(null);
      } catch (error) {
        console.error('Error fetching role definitions:', error);
        setError('Failed to load role definitions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoleDefinitions();
  }, [subscriptionId, permissionsApi]);

  // Handle subscription ID input
  const handleSubscriptionChange = (e) => {
    setSubscriptionId(e.target.value);
  };

  // Handle role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  return (
    <div className="role-definitions-container">
      <h3>Role Definitions</h3>
      <p>View details of Azure role definitions</p>
      
      <div className="subscription-input">
        <label htmlFor="subscriptionId">Subscription ID:</label>
        <input
          type="text"
          id="subscriptionId"
          value={subscriptionId}
          onChange={handleSubscriptionChange}
          placeholder="Enter Azure Subscription ID"
        />
      </div>
      
      {loading && <div className="loading-indicator">Loading role definitions...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && roleDefinitions.length === 0 && subscriptionId && (
        <div className="no-data-message">No role definitions found for this subscription.</div>
      )}
      
      {!loading && !error && roleDefinitions.length > 0 && (
        <div className="roles-container">
          <div className="roles-list">
            <h4>Available Roles</h4>
            <ul>
              {roleDefinitions.map(role => (
                <li 
                  key={role.id} 
                  className={selectedRole && selectedRole.id === role.id ? 'selected' : ''}
                  onClick={() => handleRoleSelect(role)}
                >
                  {role.roleName || 'Unnamed Role'}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="role-details">
            {selectedRole ? (
              <>
                <h4>{selectedRole.roleName || 'Unnamed Role'}</h4>
                
                {selectedRole.description && (
                  <div className="role-description">
                    {selectedRole.description}
                  </div>
                )}
                
                <h5>Permissions</h5>
                {selectedRole.permissions.length === 0 ? (
                  <p>No permissions defined for this role.</p>
                ) : (
                  selectedRole.permissions.map((permission, permIndex) => (
                    <div key={permIndex} className="permission-section">
                      {permission.actions.length > 0 && (
                        <div className="permission-group">
                          <h6>Actions</h6>
                          <ul className="actions-list">
                            {permission.actions.map((action, actionIndex) => (
                              <li key={actionIndex}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {permission.notActions.length > 0 && (
                        <div className="permission-group">
                          <h6>Not Actions</h6>
                          <ul className="not-actions-list">
                            {permission.notActions.map((action, actionIndex) => (
                              <li key={actionIndex}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {permission.dataActions.length > 0 && (
                        <div className="permission-group">
                          <h6>Data Actions</h6>
                          <ul className="data-actions-list">
                            {permission.dataActions.map((action, actionIndex) => (
                              <li key={actionIndex}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {permission.notDataActions.length > 0 && (
                        <div className="permission-group">
                          <h6>Not Data Actions</h6>
                          <ul className="not-data-actions-list">
                            {permission.notDataActions.map((action, actionIndex) => (
                              <li key={actionIndex}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                )}
                
                <h5>Assignable Scopes</h5>
                {selectedRole.assignableScopes.length === 0 ? (
                  <p>No assignable scopes defined for this role.</p>
                ) : (
                  <ul className="assignable-scopes-list">
                    {selectedRole.assignableScopes.map((scope, scopeIndex) => (
                      <li key={scopeIndex}>{scope}</li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="select-role-message">Select a role to view its details</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleDefinitions;
