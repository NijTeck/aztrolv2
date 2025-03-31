import React, { useState, useEffect } from 'react';
import useApiService from '../services/apiService';

/**
 * Cost Breakdown Component
 * Displays cost breakdown by resource type
 */
const CostBreakdown = () => {
  const { costApi } = useApiService();
  const [subscriptionId, setSubscriptionId] = useState('');
  const [timeframe, setTimeframe] = useState('MonthToDate');
  const [breakdownData, setBreakdownData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cost breakdown data when subscription ID or timeframe changes
  useEffect(() => {
    const fetchBreakdownData = async () => {
      if (!subscriptionId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await costApi.getCostBreakdown(subscriptionId, timeframe);
        setBreakdownData(data);
      } catch (error) {
        console.error('Error fetching cost breakdown:', error);
        setError('Failed to load cost breakdown. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBreakdownData();
  }, [subscriptionId, timeframe, costApi]);

  // Handle subscription ID input
  const handleSubscriptionChange = (e) => {
    setSubscriptionId(e.target.value);
  };

  // Handle timeframe selection
  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="cost-breakdown-container">
      <h3>Cost Breakdown</h3>
      <p>Analyze costs by resource type</p>
      
      <div className="filter-controls">
        <div className="subscription-selector">
          <label htmlFor="subscriptionId">Subscription ID:</label>
          <input
            type="text"
            id="subscriptionId"
            value={subscriptionId}
            onChange={handleSubscriptionChange}
            placeholder="Enter Azure Subscription ID"
          />
        </div>
        
        <div className="timeframe-selector">
          <label htmlFor="timeframe">Timeframe:</label>
          <select
            id="timeframe"
            value={timeframe}
            onChange={handleTimeframeChange}
          >
            <option value="MonthToDate">Month to Date</option>
            <option value="BillingMonthToDate">Billing Month to Date</option>
            <option value="TheLastMonth">Last Month</option>
            <option value="TheLastBillingMonth">Last Billing Month</option>
          </select>
        </div>
      </div>
      
      {loading && <div className="loading-indicator">Loading cost breakdown...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && breakdownData && breakdownData.costBreakdown.length > 0 && (
        <div className="breakdown-content">
          <div className="chart-placeholder">
            <div className="chart-title">Cost Distribution by Resource Type</div>
            <div className="chart-message">
              Chart visualization would be implemented here using a library like Recharts
            </div>
          </div>
          
          <div className="table-container">
            <table className="cost-table">
              <thead>
                <tr>
                  <th>Resource Type</th>
                  <th>Cost</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {breakdownData.costBreakdown.map((item, index) => (
                  <tr key={index}>
                    <td>{item.resourceType}</td>
                    <td>{formatCurrency(item.cost, breakdownData.currency)}</td>
                    <td>{formatPercentage(item.percentage)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Total</strong></td>
                  <td><strong>{formatCurrency(breakdownData.totalCost, breakdownData.currency)}</strong></td>
                  <td><strong>100%</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
      
      {!loading && !error && (!breakdownData || breakdownData.costBreakdown.length === 0) && subscriptionId && (
        <div className="no-data-message">No cost breakdown data found for this subscription and timeframe.</div>
      )}
    </div>
  );
};

export default CostBreakdown;
