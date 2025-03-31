import React, { useState } from 'react';
import useApiService from '../services/apiService';

/**
 * IP Flow Verification Component
 * Tool to check if traffic is allowed between source and destination
 */
const IPFlowVerify = () => {
  const { networkApi } = useApiService();
  const [formData, setFormData] = useState({
    subscriptionId: '',
    resourceGroup: '',
    networkWatcherName: '',
    sourceIP: '',
    destinationIP: '',
    direction: 'Inbound',
    protocol: 'TCP',
    destinationPort: '80',
    sourcePort: '0',
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
      const verificationResult = await networkApi.verifyIpFlow(formData);
      setResult(verificationResult);
    } catch (error) {
      console.error('Error verifying IP flow:', error);
      setError('Failed to verify IP flow. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ip-flow-verify-container">
      <h3>IP Flow Verification</h3>
      <p>Check if traffic is allowed between source and destination</p>
      
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
            <label htmlFor="targetResourceId">Target Resource ID (Optional)</label>
            <input
              type="text"
              id="targetResourceId"
              name="targetResourceId"
              value={formData.targetResourceId}
              onChange={handleChange}
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
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="direction">Direction</label>
            <select
              id="direction"
              name="direction"
              value={formData.direction}
              onChange={handleChange}
              required
            >
              <option value="Inbound">Inbound</option>
              <option value="Outbound">Outbound</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="protocol">Protocol</label>
            <select
              id="protocol"
              name="protocol"
              value={formData.protocol}
              onChange={handleChange}
              required
            >
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sourcePort">Source Port</label>
            <input
              type="text"
              id="sourcePort"
              name="sourcePort"
              value={formData.sourcePort}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="destinationPort">Destination Port</label>
            <input
              type="text"
              id="destinationPort"
              name="destinationPort"
              value={formData.destinationPort}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify IP Flow'}
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
          <h4>Verification Result</h4>
          <div className={`result-status ${result.access === 'Allow' ? 'success' : 'error'}`}>
            Traffic is <strong>{result.access === 'Allow' ? 'Allowed' : 'Denied'}</strong>
          </div>
          
          {result.ruleName && (
            <div className="result-detail">
              <span className="detail-label">Rule Name:</span>
              <span className="detail-value">{result.ruleName}</span>
            </div>
          )}
          
          <h5>Packet Flow</h5>
          <div className="packet-flow">
            <div className="flow-detail">
              <span className="detail-label">Direction:</span>
              <span className="detail-value">{result.packetFlow.direction}</span>
            </div>
            <div className="flow-detail">
              <span className="detail-label">Protocol:</span>
              <span className="detail-value">{result.packetFlow.protocol}</span>
            </div>
            <div className="flow-detail">
              <span className="detail-label">Source IP:</span>
              <span className="detail-value">{result.packetFlow.sourceIP}</span>
            </div>
            <div className="flow-detail">
              <span className="detail-label">Source Port:</span>
              <span className="detail-value">{result.packetFlow.sourcePort}</span>
            </div>
            <div className="flow-detail">
              <span className="detail-label">Destination IP:</span>
              <span className="detail-value">{result.packetFlow.destinationIP}</span>
            </div>
            <div className="flow-detail">
              <span className="detail-label">Destination Port:</span>
              <span className="detail-value">{result.packetFlow.destinationPort}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IPFlowVerify;
