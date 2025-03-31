import React, { useState, useEffect } from 'react';
import useApiService from '../services/apiService';

/**
 * Cost Trend Component
 * Displays cost trends over time
 */
const CostTrend = () => {
  const { costApi } = useApiService();
  const [subscriptionId, setSubscriptionId] = useState('');
  const [period, setPeriod] = useState('Last30Days');
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cost trend data when subscription ID or period changes
  useEffect(() => {
    const fetchTrendData = async () => {
      if (!subscriptionId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await costApi.getCostTrend(subscriptionId, period);
        setTrendData(data);
      } catch (error) {
        console.error('Error fetching cost trend:', error);
        setError('Failed to load cost trend data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrendData();
  }, [subscriptionId, period, costApi]);

  // Handle subscription ID input
  const handleSubscriptionChange = (e) => {
    setSubscriptionId(e.target.value);
  };

  // Handle period selection
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="cost-trend-container">
      <h3>Cost Trends</h3>
      <p>View cost trends over time</p>
      
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
        
        <div className="time-period-selector">
          <button 
            className={period === 'Last30Days' ? 'active' : ''}
            onClick={() => handlePeriodChange('Last30Days')}
          >
            Last 30 Days
          </button>
          <button 
            className={period === 'Last3Months' ? 'active' : ''}
            onClick={() => handlePeriodChange('Last3Months')}
          >
            Last 3 Months
          </button>
          <button 
            className={period === 'Last12Months' ? 'active' : ''}
            onClick={() => handlePeriodChange('Last12Months')}
          >
            Last 12 Months
          </button>
        </div>
      </div>
      
      {loading && <div className="loading-indicator">Loading cost trend data...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && trendData && trendData.costTrend.length > 0 && (
        <div className="trend-content">
          <div className="chart-placeholder">
            <div className="chart-title">Cost Trend ({period})</div>
            <div className="chart-message">
              Chart visualization would be implemented here using a library like Recharts
            </div>
          </div>
          
          <div className="table-container">
            <table className="trend-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {trendData.costTrend.map((item, index) => (
                  <tr key={index}>
                    <td>{formatDate(item.date)}</td>
                    <td>{formatCurrency(item.cost, trendData.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {!loading && !error && (!trendData || trendData.costTrend.length === 0) && subscriptionId && (
        <div className="no-data-message">No cost trend data found for this subscription and period.</div>
      )}
    </div>
  );
};

export default CostTrend;
