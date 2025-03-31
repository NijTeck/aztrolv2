import React, { useState, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import useApiService from '../services/apiService';

// Custom node types
const nodeTypes = {
  vnet: ({ data }) => (
    <div className="vnet-node">
      <div className="node-header">
        <span className="node-type">VNET</span>
      </div>
      <div className="node-content">
        <div className="node-title">{data.name}</div>
        <div className="node-details">
          <div className="detail-item">
            <span className="detail-label">Address Space:</span>
            <span className="detail-value">{data.addressSpace.join(', ')}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Location:</span>
            <span className="detail-value">{data.location}</span>
          </div>
        </div>
      </div>
    </div>
  ),
  subnet: ({ data }) => (
    <div className="subnet-node">
      <div className="node-header">
        <span className="node-type">Subnet</span>
      </div>
      <div className="node-content">
        <div className="node-title">{data.name}</div>
        <div className="node-details">
          <div className="detail-item">
            <span className="detail-label">Address Prefix:</span>
            <span className="detail-value">{data.addressPrefix}</span>
          </div>
        </div>
      </div>
    </div>
  )
};

/**
 * Network Topology Visualization Component
 * Displays an interactive visualization of Azure network resources
 */
const NetworkTopology = ({ subscriptionId, onNodeSelect }) => {
  const { networkApi } = useApiService();
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch network topology data
  useEffect(() => {
    const fetchTopology = async () => {
      if (!subscriptionId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const topologyData = await networkApi.getTopology(subscriptionId);
        
        // Transform API data to ReactFlow format
        const flowNodes = topologyData.nodes.map(node => ({
          id: node.id,
          type: node.type,
          data: {
            ...node.data,
            name: node.name
          },
          position: getNodePosition(node, topologyData.nodes),
          style: {
            width: node.type === 'vnet' ? 250 : 200,
            height: 'auto'
          }
        }));
        
        const flowEdges = topologyData.edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#0078d4' }
        }));
        
        setNodes(flowNodes);
        setEdges(flowEdges);
      } catch (error) {
        console.error('Error fetching network topology:', error);
        setError('Failed to load network topology. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopology();
  }, [subscriptionId, networkApi]);

  // Handle node click
  const handleNodeClick = (event, node) => {
    if (onNodeSelect) {
      onNodeSelect(node.id);
    }
  };

  // Helper function to position nodes in a visually appealing layout
  const getNodePosition = (node, allNodes) => {
    // Simple layout algorithm - VNETs at the top, subnets below their parent VNETs
    const vnetCount = allNodes.filter(n => n.type === 'vnet').length;
    const vnetIndex = allNodes.filter(n => n.type === 'vnet').findIndex(n => n.id === node.id);
    
    if (node.type === 'vnet') {
      // Position VNETs horizontally
      const xSpacing = 400;
      const startX = (vnetCount * xSpacing) / 2;
      return { x: startX - (vnetIndex * xSpacing), y: 100 };
    } else if (node.type === 'subnet') {
      // Find parent VNET
      const parentEdge = allNodes
        .filter(n => n.type === 'vnet')
        .findIndex(vnet => {
          return allNodes
            .filter(n => n.type === 'subnet')
            .findIndex(subnet => subnet.id === node.id) >= 0;
        });
      
      // Position subnets below their parent VNET
      const subnetIndex = allNodes
        .filter(n => n.type === 'subnet' && n.parentVnet === parentEdge)
        .findIndex(n => n.id === node.id);
      
      const xSpacing = 400;
      const ySpacing = 150;
      const startX = (vnetCount * xSpacing) / 2;
      
      return { 
        x: startX - (parentEdge * xSpacing) + (subnetIndex * 50) - 100, 
        y: 300 + (subnetIndex * ySpacing)
      };
    }
    
    // Default position for unknown node types
    return { x: 0, y: 0 };
  };

  return (
    <div className="network-topology-container">
      {loading && <div className="loading-indicator">Loading network topology...</div>}
      {error && <div className="error-message">{error}</div>}
      
      <div className="flow-container" style={{ height: 600 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
};

export default NetworkTopology;
