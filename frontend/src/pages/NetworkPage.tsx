import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Background, Controls, MiniMap,
  useNodesState, useEdgesState,
  Node, Edge, NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import useApiService from '../services/apiService';

interface VNetData {
  label: string;
  addressSpace: string;
  location: string;
  onClick: () => void;
}

interface SubnetData {
  label: string;
  addressPrefix: string;
  onClick: () => void;
}

interface VNet {
  id: string;
  name: string;
  addressSpace: string;
  location: string;
  type: string;
  subnets: Subnet[];
}

interface Subnet {
  id: string;
  name: string;
  addressPrefix: string;
  type: string;
}

const VNetNode: React.FC<{ data: VNetData }> = ({ data }) => (
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

const SubnetNode: React.FC<{ data: SubnetData }> = ({ data }) => (
  <div className="subnet-node" onClick={data.onClick}>
    <div className="node-header">Subnet</div>
    <div className="node-title">{data.label}</div>
    <div className="detail-item">
      <span className="detail-label">Address Prefix:</span> {data.addressPrefix}
    </div>
  </div>
);

const NetworkPage: React.FC = () => {
  const { networkApi, loading, error } = useApiService();
  const [subscriptionId, setSubscriptionId] = useState<string>('');
  const [selectedResource, setSelectedResource] = useState<VNet | Subnet | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

  const nodeTypes: NodeTypes = {
    vnetNode: VNetNode,
    subnetNode: SubnetNode
  };

  const handleResourceSelect = (resource: VNet | Subnet) => {
    setSelectedResource(resource);
  };

  const loadNetworkTopology = useCallback(async () => {
    if (!subscriptionId) return;
    
    try {
      const data = await networkApi.getNetworkTopology(subscriptionId);
      
      const flowNodes: Node[] = [];
      const flowEdges: Edge[] = [];
      
      // Add VNet nodes
      data.vnets.forEach((vnet: VNet, vnetIndex: number) => {
        flowNodes.push({
          id: vnet.id,
          type: 'vnetNode',
          position: { x: 250, y: vnetIndex * 300 },
          data: { 
            label: vnet.name,
            addressSpace: vnet.addressSpace,
            location: vnet.location,
            onClick: () => handleResourceSelect(vnet)
          }
        });
        
        // Add subnet nodes for each VNet
        vnet.subnets.forEach((subnet: Subnet, subnetIndex: number) => {
          const subnetNodeId = subnet.id;
          
          flowNodes.push({
            id: subnetNodeId,
            type: 'subnetNode',
            position: { x: 600, y: vnetIndex * 300 + subnetIndex * 100 },
            data: { 
              label: subnet.name,
              addressPrefix: subnet.addressPrefix,
              onClick: () => handleResourceSelect(subnet)
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
    }
  }, [subscriptionId, networkApi, setNodes, setEdges]);

  return (
    <div>
      <h2>Network Management</h2>
      
      <h3>Network Topology</h3>
      <p>Visualize your Azure Virtual Networks and Subnets</p>
      
      <div className="subscription-input">
        <label htmlFor="subscriptionId">Subscription ID:</label>
        <input
          type="text"
          id="subscriptionId"
          value={subscriptionId}
          onChange={(e) => setSubscriptionId(e.target.value)}
          placeholder="Enter your Azure Subscription ID"
        />
        <button 
          onClick={loadNetworkTopology}
          disabled={!subscriptionId || loading}
        >
          {loading ? 'Loading...' : 'Load Network Topology'}
        </button>
      </div>
      
      <h4>Network Topology Visualization</h4>
      <div className="network-visualization">
        {nodes.length > 0 ? (
          <div style={{ height: 600 }}>
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
            {loading ? 'Loading network topology...' : 'Enter a subscription ID and click "Load Network Topology" to visualize your Azure network.'}
          </div>
        )}
      </div>
      
      <h3>Network Resource Details</h3>
      <p>View detailed information about your network resources</p>
      
      <div className="resource-details">
        {selectedResource ? (
          <div>
            <h4>{selectedResource.name}</h4>
            <div className="detail-row">
              <span className="detail-label">Type:</span>
              <span>{selectedResource.type}</span>
            </div>
          </div>
        ) : (
          <p>Select a resource in the topology view to see its details here.</p>
        )}
      </div>
      
      <h3>Network Troubleshooting Tools</h3>
      <p>Tools to help diagnose network connectivity issues</p>
      
      <h4>IP Flow Verify</h4>
      <p>Check if traffic is allowed between source and destination</p>
      <div>Coming Soon</div>
      
      <h4>Next Hop</h4>
      <p>Determine the next hop for routing a packet</p>
      <div>Coming Soon</div>
    </div>
  );
};

export default NetworkPage; 