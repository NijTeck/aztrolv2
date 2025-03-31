import React, { useState, useEffect } from 'react';
import useApiService from '../services/apiService';

/**
 * Resource Details Component
 * Displays detailed information about a selected network resource
 */
const ResourceDetails = ({ resourceId }) => {
  const { networkApi } = useApiService();
  const [resourceDetails, setResourceDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch resource details when resourceId changes
  useEffect(() => {
    const fetchResourceDetails = async () => {
      if (!resourceId) {
        setResourceDetails(null);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const details = await networkApi.getResourceDetails(resourceId);
        setResourceDetails(details);
      } catch (error) {
        console.error('Error fetching resource details:', error);
        setError('Failed to load resource details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResourceDetails();
  }, [resourceId, networkApi]);

  if (loading) {
    return <div className="loading-indicator">Loading resource details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!resourceId) {
    return (
      <div className="resource-details-placeholder">
        <p>Select a resource in the topology view to see its details</p>
      </div>
    );
  }

  if (!resourceDetails) {
    return null;
  }

  return (
    <div className="resource-details">
      <h3>{resourceDetails.name}</h3>
      <div className="details-section">
        <div className="detail-row">
          <span className="detail-label">Type:</span>
          <span className="detail-value">{resourceDetails.type}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Resource Group:</span>
          <span className="detail-value">{resourceDetails.resourceGroup}</span>
        </div>
        {resourceDetails.location && (
          <div className="detail-row">
            <span className="detail-label">Location:</span>
            <span className="detail-value">{resourceDetails.location}</span>
          </div>
        )}
      </div>

      <h4>Properties</h4>
      <div className="details-section">
        {renderProperties(resourceDetails.properties)}
      </div>
    </div>
  );
};

/**
 * Helper function to render resource properties
 * @param {object} properties - Resource properties
 * @returns {JSX.Element} - Rendered properties
 */
const renderProperties = (properties) => {
  if (!properties) return null;

  return Object.entries(properties).map(([key, value]) => {
    // Skip rendering empty arrays or objects
    if (Array.isArray(value) && value.length === 0) return null;
    if (value === null || value === undefined) return null;

    // Render arrays
    if (Array.isArray(value)) {
      return (
        <div key={key} className="property-section">
          <h5>{formatPropertyName(key)} ({value.length})</h5>
          <ul className="property-list">
            {value.map((item, index) => (
              <li key={index}>
                {typeof item === 'object' ? (
                  <div className="nested-property">
                    {Object.entries(item).map(([nestedKey, nestedValue]) => (
                      <div key={nestedKey} className="detail-row">
                        <span className="detail-label">{formatPropertyName(nestedKey)}:</span>
                        <span className="detail-value">
                          {renderPropertyValue(nestedValue)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  renderPropertyValue(item)
                )}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // Render objects
    if (typeof value === 'object') {
      return (
        <div key={key} className="property-section">
          <h5>{formatPropertyName(key)}</h5>
          <div className="nested-property">
            {Object.entries(value).map(([nestedKey, nestedValue]) => (
              nestedValue !== null && (
                <div key={nestedKey} className="detail-row">
                  <span className="detail-label">{formatPropertyName(nestedKey)}:</span>
                  <span className="detail-value">
                    {renderPropertyValue(nestedValue)}
                  </span>
                </div>
              )
            ))}
          </div>
        </div>
      );
    }

    // Render simple values
    return (
      <div key={key} className="detail-row">
        <span className="detail-label">{formatPropertyName(key)}:</span>
        <span className="detail-value">{renderPropertyValue(value)}</span>
      </div>
    );
  });
};

/**
 * Format property name for display
 * @param {string} name - Property name
 * @returns {string} - Formatted property name
 */
const formatPropertyName = (name) => {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

/**
 * Render property value based on type
 * @param {any} value - Property value
 * @returns {string|JSX.Element} - Rendered property value
 */
const renderPropertyValue = (value) => {
  if (value === null || value === undefined) return 'None';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return value.toString();
};

export default ResourceDetails;
