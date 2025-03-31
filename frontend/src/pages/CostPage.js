import React from 'react';

/**
 * Cost Management Page
 * Displays cost analysis and management features
 */
const CostPage = () => {
  return (
    <div className="cost-page">
      <h1>Cost Management</h1>
      <div className="feature-card">
        <h2>Current Month Cost Overview</h2>
        <p>View total cost for the current month</p>
        <div className="cost-overview-container">
          <div className="subscription-selector">
            <label>Subscription:</label>
            <select disabled>
              <option>Select a subscription</option>
            </select>
          </div>
          <div className="cost-display">
            <div className="cost-card">
              <h3>Total Cost</h3>
              <div className="placeholder-cost">$0.00</div>
              <p className="time-period">Current Month</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="feature-card">
        <h2>Cost Breakdown</h2>
        <p>Analyze costs by resource type and service</p>
        <div className="cost-breakdown-container">
          <div className="chart-placeholder">
            <p className="placeholder-text">Cost breakdown chart will be displayed here</p>
          </div>
          <div className="cost-table-placeholder">
            <table className="cost-table">
              <thead>
                <tr>
                  <th>Resource Type</th>
                  <th>Cost</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="3" className="placeholder-text">Select a subscription to view cost breakdown</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="feature-card">
        <h2>Cost Trends</h2>
        <p>View cost trends over time</p>
        <div className="cost-trends-container">
          <div className="time-period-selector">
            <button disabled>Last 30 Days</button>
            <button disabled>Last 3 Months</button>
            <button disabled>Last 12 Months</button>
          </div>
          <div className="trend-chart-placeholder">
            <p className="placeholder-text">Cost trend chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostPage;
