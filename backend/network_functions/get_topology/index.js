// backend/network_functions/get_topology/index.js
const { DefaultAzureCredential } = require('@azure/identity');
const { NetworkManagementClient } = require('@azure/arm-network');

module.exports = async function (context, req) {
    try {
        // Get subscription ID from query parameter
        const subscriptionId = req.query.subscriptionId;
        
        if (!subscriptionId) {
            context.res = {
                status: 400,
                body: { error: "Subscription ID is required" }
            };
            return;
        }
        
        // Use DefaultAzureCredential which will use the environment variables
        // AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET
        const credential = new DefaultAzureCredential();
        
        // Create network client
        const networkClient = new NetworkManagementClient(credential, subscriptionId);
        
        // Get all virtual networks
        const vnets = await networkClient.virtualNetworks.listAll();
        
        // Transform the data for frontend consumption
        const result = {
            vnets: await Promise.all(vnets.map(async (vnet) => {
                // Get subnets for each VNet
                const subnets = await networkClient.subnets.list(
                    getResourceGroupFromId(vnet.id),
                    vnet.name
                );
                
                return {
                    id: vnet.id,
                    name: vnet.name,
                    addressSpace: vnet.addressSpace.addressPrefixes.join(', '),
                    location: vnet.location,
                    subnets: subnets.map(subnet => ({
                        id: subnet.id,
                        name: subnet.name,
                        addressPrefix: subnet.addressPrefix
                    }))
                };
            }))
        };
        
        context.res = {
            status: 200,
            body: result
        };
    } catch (error) {
        context.log.error('Error fetching network topology:', error);
        
        context.res = {
            status: 500,
            body: { 
                error: "Failed to fetch network topology",
                details: error.message
            }
        };
    }
};

// Helper function to extract resource group from resource ID
function getResourceGroupFromId(resourceId) {
    const match = resourceId.match(/\/resourceGroups\/([^\/]+)/i);
    return match ? match[1] : '';
}
