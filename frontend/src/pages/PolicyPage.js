import React from 'react';

/**
 * Policy Management Page
 * Displays policy compliance features
 */
const PolicyPage = () => {
  return (
    <div className="policy-page">
      <h1>Policy Management</h1>
      <div className="feature-card">
        <h2>Policy Compliance Overview</h2>
        <p>View compliance status for your Azure policies</p>
        <div className="compliance-overview-container">
          <div className="subscription-selector">
            <label>Subscription:</label>
            <select disabled>
              <option>Select a subscription</option>
            </select>
          </div>
          <div className="compliance-summary">
            <div className="compliance-card compliant">
              <h3>Compliant</h3>
              <div className="placeholder-count">0</div>
            </div>
            <div className="compliance-card non-compliant">
              <h3>Non-Compliant</h3>
              <div className="placeholder-count">0</div>
            </div>
            <div className="compliance-card exempt">
              <h3>Exempt</h3>
              <div className="placeholder-count">0</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="feature-card">
        <h2>Policy Assignments</h2>
        <p>View and manage policy assignments</p>
        <div className="policy-assignments-container">
          <table className="policy-table">
            <thead>
              <tr>
                <th>Policy Name</th>
                <th>Scope</th>
                <th>Compliance State</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="3" className="placeholder-text">Select a subscription to view policy assignments</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="feature-card">
        <h2>Policy Details</h2>
        <p>View detailed information about a specific policy</p>
        <div className="policy-details-container">
          <p className="placeholder-text">Select a policy to view its details</p>
          <div className="policy-resources-container" style={{display: 'none'}}>
            <h3>Non-Compliant Resources</h3>
            <table className="resources-table">
              <thead>
                <tr>
                  <th>Resource Name</th>
                  <th>Resource Type</th>
                  <th>Resource Group</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="3">No non-compliant resources found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
