// NetworkTopology.js
import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import useApiService from '../services/apiService';

// Custom node components
const VNetNode = ({ data }) => (
  <div className="vnet-node" onClick={data.onClick}>
    <div className="node-header">Virtual Network</div>
    <div className="node-title">{data.label}</div>
    <div className="detail-item">
      <span className="detail-label">Address Space:</span> {data.addressSpace}
    </div>
    <div className="detail-item">
      <span className="detail-label">Location:</span> {data.location}
    </div>
  </div>
);

const SubnetNode = ({ data }) => (
  <div className="subnet-node" onClick={data.onClick}>
    <div className="node-header">Subnet</div>
    <div className="node-title">{data.label}</div>
    <div className="detail-item">
      <span className="detail-label">Address Prefix:</span> {data.addressPrefix}
    </div>
  </div>
);

const NetworkTopology = ({ onSelectResource }) => {
  const { networkApi, loading, error } = useApiService();
  const [subscriptionId, setSubscriptionId] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const nodeTypes = {
    vnetNode: VNetNode,
    subnetNode: SubnetNode
  };

  const handleSubscriptionChange = (e) => {
    setSubscriptionId(e.target.value);
  };

  const fetchTopology = useCallback(async () => {
    if (!subscriptionId) return;
    
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const data = await networkApi.getNetworkTopology(subscriptionId);
      
      // Transform the data into nodes and edges for ReactFlow
      const flowNodes = [];
      const flowEdges = [];
      
      // Add VNet nodes
      data.vnets.forEach((vnet, vnetIndex) => {
        flowNodes.push({
          id: vnet.id,
          type: 'vnetNode',
          position: { x: 250, y: vnetIndex * 300 },
          data: { 
            label: vnet.name,
            addressSpace: vnet.addressSpace,
            location: vnet.location,
            onClick: () => onSelectResource(vnet)
          }
        });
        
        // Add subnet nodes for each VNet
        vnet.subnets.forEach((subnet, subnetIndex) => {
          const subnetNodeId = subnet.id;
          
          flowNodes.push({
            id: subnetNodeId,
            type: 'subnetNode',
            position: { x: 600, y: vnetIndex * 300 + subnetIndex * 100 },
            data: { 
              label: subnet.name,
              addressPrefix: subnet.addressPrefix,
              onClick: () => onSelectResource(subnet)
            }
          });
          
          // Add edge from VNet to subnet
          flowEdges.push({
            id: `e-${vnet.id}-${subnetNodeId}`,
            source: vnet.id,
            target: subnetNodeId,
            animated: true
          });
        });
      });
      
      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (err) {
      console.error('Error fetching network topology:', err);
      setLoadError('Failed to load network topology. Please check your subscription ID and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [subscriptionId, networkApi, onSelectResource, setNodes, setEdges]);

  return (
    <div className="network-topology-container">
      <div className="topology-controls">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="subscriptionId">Subscription ID:</label>
            <input
              type="text"
              id="subscriptionId"
              value={subscriptionId}
              onChange={handleSubscriptionChange}
              placeholder="Enter Azure Subscription ID"
            />
          </div>
          <div className="form-actions">
            <button 
              onClick={fetchTopology}
              disabled={!subscriptionId || isLoading}
            >
              {isLoading ? 'Loading...' : 'Load Network Topology'}
            </button>
          </div>
        </div>
      </div>
      
      {loadError && <div className="error-message">{loadError}</div>}
      
      {nodes.length > 0 ? (
        <div className="flow-container" style={{ height: 600 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      ) : (
        <div className="no-data-message">
          {isLoading ? 'Loading network topology...' : 'Enter a subscription ID and click "Load Network Topology" to visualize your Azure network.'}
        </div>
      )}
    </div>
  );
};

export default NetworkTopology;
