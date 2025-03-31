import React, { useState } from 'react';
import useApiService from '../services/apiService';

/**
 * Get Next Hop Component
 * Tool to determine the next hop for routing a packet
 */
const GetNextHop = () => {
  const { networkApi } = useApiService();
  const [formData, setFormData] = useState({
    subscriptionId: '',
    resourceGroup: '',
    networkWatcherName: '',
    sourceIP: '',
    destinationIP: '',
    targetResourceId: ''
  });
  const [result, setResult] = useState(null);
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
    setResult(null);
    
    try {
      const nextHopResult = await networkApi.getNextHop(formData);
      setResult(nextHopResult);
    } catch (error) {
      console.error('Error getting next hop information:', error);
      setError('Failed to get next hop information. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="get-next-hop-container">
      <h3>Next Hop Information</h3>
      <p>Determine the next hop for routing a packet</p>
      
      <form onSubmit={handleSubmit} className="troubleshooting-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="subscriptionId">Subscription ID</label>
            <input
              type="text"
              id="subscriptionId"
              name="subscriptionId"
              value={formData.subscriptionId}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="resourceGroup">Resource Group</label>
            <input
              type="text"
              id="resourceGroup"
              name="resourceGroup"
              value={formData.resourceGroup}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="networkWatcherName">Network Watcher Name</label>
            <input
              type="text"
              id="networkWatcherName"
              name="networkWatcherName"
              value={formData.networkWatcherName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="targetResourceId">Target Resource ID</label>
            <input
              type="text"
              id="targetResourceId"
              name="targetResourceId"
              value={formData.targetResourceId}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sourceIP">Source IP</label>
            <input
              type="text"
              id="sourceIP"
              name="sourceIP"
              value={formData.sourceIP}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="destinationIP">Destination IP</label>
            <input
              type="text"
              id="destinationIP"
              name="destinationIP"
              value={formData.destinationIP}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Getting Next Hop...' : 'Get Next Hop'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {result && (
        <div className="result-container">
          <h4>Next Hop Information</h4>
          
          <div className="result-detail">
            <span className="detail-label">Next Hop Type:</span>
            <span className="detail-value">{result.nextHopType}</span>
          </div>
          
          {result.nextHopIpAddress && (
            <div className="result-detail">
              <span className="detail-label">Next Hop IP Address:</span>
              <span className="detail-value">{result.nextHopIpAddress}</span>
            </div>
          )}
          
          {result.routeTableId && (
            <div className="result-detail">
              <span className="detail-label">Route Table ID:</span>
              <span className="detail-value">{result.routeTableId}</span>
            </div>
          )}
          
          <h5>Packet Flow</h5>
          <div className="packet-flow">
            <div className="flow-detail">
              <span className="detail-label">Source IP:</span>
              <span className="detail-value">{result.packetFlow.sourceIP}</span>
            </div>
            <div className="flow-detail">
              <span className="detail-label">Destination IP:</span>
              <span className="detail-value">{result.packetFlow.destinationIP}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetNextHop;
