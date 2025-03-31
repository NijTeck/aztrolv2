const { DefaultAzureCredential } = require('@azure/identity');
const { NetworkManagementClient } = require('@azure/arm-network');

/**
 * Azure Function to get network topology data
 * @param {object} context - Azure Functions context
 * @param {object} req - HTTP request
 */
module.exports = async function (context, req) {
    try {
        // Get subscription ID from query parameters
        const subscriptionId = req.query.subscriptionId;
        
        if (!subscriptionId) {
            context.res = {
                status: 400,
                body: { error: "Missing required parameter: subscriptionId" }
            };
            return;
        }

        // Authenticate with DefaultAzureCredential
        const credential = new DefaultAzureCredential();
        
        // Create NetworkManagementClient
        const networkClient = new NetworkManagementClient(credential, subscriptionId);
        
        // Get all VNETs in the subscription
        const vnets = await networkClient.virtualNetworks.listAll();
        
        // Transform data to frontend format (nodes/edges)
        const nodes = [];
        const edges = [];
        
        // Process VNETs and their subnets
        for (const vnet of vnets) {
            // Add VNET as a node
            const vnetId = vnet.id;
            const vnetName = vnet.name;
            
            nodes.push({
                id: vnetId,
                type: 'vnet',
                name: vnetName,
                data: {
                    addressSpace: vnet.addressSpace.addressPrefixes,
                    location: vnet.location,
                    resourceGroup: getResourceGroupFromId(vnetId)
                }
            });
            
            // Process subnets
            if (vnet.subnets) {
                for (const subnet of vnet.subnets) {
                    const subnetId = subnet.id;
                    const subnetName = subnet.name;
                    
                    // Add subnet as a node
                    nodes.push({
                        id: subnetId,
                        type: 'subnet',
                        name: subnetName,
                        data: {
                            addressPrefix: subnet.addressPrefix,
                            networkSecurityGroup: subnet.networkSecurityGroup ? subnet.networkSecurityGroup.id : null
                        }
                    });
                    
                    // Add edge from VNET to subnet
                    edges.push({
                        id: `${vnetId}-${subnetId}`,
                        source: vnetId,
                        target: subnetId,
                        type: 'contains'
                    });
                }
            }
        }
        
        // Return the topology data
        context.res = {
            status: 200,
            body: {
                nodes,
                edges
            }
        };
    } catch (error) {
        context.log.error(`Error getting network topology: ${error.message}`);
        
        context.res = {
            status: 500,
            body: { error: `Failed to get network topology: ${error.message}` }
        };
    }
};

/**
 * Extract resource group name from Azure resource ID
 * @param {string} resourceId - Azure resource ID
 * @returns {string} - Resource group name
 */
function getResourceGroupFromId(resourceId) {
    const match = resourceId.match(/\/resourceGroups\/([^\/]+)/i);
    return match ? match[1] : '';
}
