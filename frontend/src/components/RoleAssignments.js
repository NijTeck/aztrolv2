import React, { useState, useEffect } from 'react';
import useApiService from '../services/apiService';

/**
 * Role Assignments Component
 * Displays role assignments for a selected scope
 */
const RoleAssignments = () => {
  const { permissionsApi } = useApiService();
  const [scope, setScope] = useState('');
  const [resourceGroups, setResourceGroups] = useState([]);
  const [roleAssignments, setRoleAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch resource groups (simplified - in a real app, you'd use Azure Management API)
  useEffect(() => {
    // Mock resource groups for demonstration
    setResourceGroups([
      { id: '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg1', name: 'Resource Group 1' },
      { id: '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg2', name: 'Resource Group 2' },
      { id: '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg3', name: 'Resource Group 3' }
    ]);
  }, []);

  // Fetch role assignments when scope changes
  useEffect(() => {
    const fetchRoleAssignments = async () => {
      if (!scope) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const assignments = await permissionsApi.getRoleAssignments(scope);
        setRoleAssignments(assignments);
      } catch (error) {
        console.error('Error fetching role assignments:', error);
        setError('Failed to load role assignments. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoleAssignments();
  }, [scope, permissionsApi]);

  // Handle scope selection
  const handleScopeChange = (e) => {
    setScope(e.target.value);
  };

  return (
    <div className="role-assignments-container">
      <h3>Role Assignments</h3>
      <p>View role assignments for your Azure resources</p>
      
      <div className="scope-selector">
        <label htmlFor="scope">Resource Group:</label>
        <select
          id="scope"
          value={scope}
          onChange={handleScopeChange}
        >
          <option value="">Select a Resource Group</option>
          {resourceGroups.map(rg => (
            <option key={rg.id} value={rg.id}>{rg.name}</option>
          ))}
        </select>
      </div>
      
      {loading && <div className="loading-indicator">Loading role assignments...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && roleAssignments.length === 0 && scope && (
        <div className="no-data-message">No role assignments found for this scope.</div>
      )}
      
      {!loading && !error && roleAssignments.length > 0 && (
        <div className="table-container">
          <table className="role-assignments-table">
            <thead>
              <tr>
                <th>Principal Name</th>
                <th>Role Name</th>
                <th>Scope</th>
              </tr>
            </thead>
            <tbody>
              {roleAssignments.map(assignment => (
                <tr key={assignment.id}>
                  <td>{assignment.principalName}</td>
                  <td>{assignment.roleName}</td>
                  <td>{formatScope(assignment.scope)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default RoleAssignments;
