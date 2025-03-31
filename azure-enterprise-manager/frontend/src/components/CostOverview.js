import React, { useState, useEffect } from 'react';
import useApiService from '../services/apiService';

/**
 * Cost Overview Component
 * Displays total cost for the current month
 */
const CostOverview = () => {
  const { costApi } = useApiService();
  const [subscriptionId, setSubscriptionId] = useState('');
  const [costData, setCostData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cost data when subscription ID changes
  useEffect(() => {
    const fetchCostData = async () => {
      if (!subscriptionId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await costApi.getCurrentMonthCost(subscriptionId);
        setCostData(data);
      } catch (error) {
        console.error('Error fetching cost data:', error);
        setError('Failed to load cost data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCostData();
  }, [subscriptionId, costApi]);

  // Handle subscription ID input
  const handleSubscriptionChange = (e) => {
    setSubscriptionId(e.target.value);
  };

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="cost-overview-container">
      <h3>Current Month Cost Overview</h3>
      <p>View total cost for the current month</p>
      
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
      
      {loading && <div className="loading-indicator">Loading cost data...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && costData && (
        <div className="cost-display">
          <div className="cost-card">
            <h4>Total Cost</h4>
            <div className="cost-amount">{formatCurrency(costData.totalCost, costData.currency)}</div>
            <p className="time-period">{costData.timeframe === 'MonthToDate' ? 'Current Month' : costData.timeframe}</p>
          </div>
        </div>
      )}
      
      {!loading && !error && !costData && subscriptionId && (
        <div className="no-data-message">No cost data found for this subscription.</div>
      )}
    </div>
  );
};

export default CostOverview;
