const { DefaultAzureCredential } = require('@azure/identity');
const { NetworkManagementClient } = require('@azure/arm-network');
const { ComputeManagementClient } = require('@azure/arm-compute');

/**
 * Azure Function to get network resource details
 * @param {object} context - Azure Functions context
 * @param {object} req - HTTP request
 */
module.exports = async function (context, req) {
    try {
        // Get resource ID from request parameters
        const resourceId = req.params.resourceId;
        
        if (!resourceId) {
            context.res = {
                status: 400,
                body: { error: "Missing required parameter: resourceId" }
            };
            return;
        }

        // Extract subscription ID from resource ID
        const subscriptionId = getSubscriptionIdFromResourceId(resourceId);
        
        if (!subscriptionId) {
            context.res = {
                status: 400,
                body: { error: "Invalid resource ID format" }
            };
            return;
        }

        // Authenticate with DefaultAzureCredential
        const credential = new DefaultAzureCredential();
        
        // Determine resource type and get details
        const resourceDetails = await getResourceDetails(credential, resourceId, subscriptionId);
        
        // Return the resource details
        context.res = {
            status: 200,
            body: resourceDetails
        };
    } catch (error) {
        context.log.error(`Error getting resource details: ${error.message}`);
        
        context.res = {
            status: 500,
            body: { error: `Failed to get resource details: ${error.message}` }
        };
    }
};

/**
 * Extract subscription ID from Azure resource ID
 * @param {string} resourceId - Azure resource ID
 * @returns {string} - Subscription ID
 */
function getSubscriptionIdFromResourceId(resourceId) {
    const match = resourceId.match(/\/subscriptions\/([^\/]+)/i);
    return match ? match[1] : '';
}

/**
 * Get resource details based on resource type
 * @param {object} credential - Azure credential
 * @param {string} resourceId - Azure resource ID
 * @param {string} subscriptionId - Subscription ID
 * @returns {object} - Resource details
 */
async function getResourceDetails(credential, resourceId, subscriptionId) {
    // Determine resource type
    if (resourceId.includes('/virtualNetworks/')) {
        return getVirtualNetworkDetails(credential, resourceId, subscriptionId);
    } else if (resourceId.includes('/subnets/')) {
        return getSubnetDetails(credential, resourceId, subscriptionId);
    } else if (resourceId.includes('/networkInterfaces/')) {
        return getNetworkInterfaceDetails(credential, resourceId, subscriptionId);
    } else if (resourceId.includes('/publicIPAddresses/')) {
        return getPublicIPDetails(credential, resourceId, subscriptionId);
    } else if (resourceId.includes('/networkSecurityGroups/')) {
        return getNsgDetails(credential, resourceId, subscriptionId);
    } else if (resourceId.includes('/virtualMachines/')) {
        return getVirtualMachineDetails(credential, resourceId, subscriptionId);
    } else {
        throw new Error(`Unsupported resource type: ${resourceId}`);
    }
}

/**
 * Get virtual network details
 * @param {object} credential - Azure credential
 * @param {string} resourceId - Azure resource ID
 * @param {string} subscriptionId - Subscription ID
 * @returns {object} - Virtual network details
 */
async function getVirtualNetworkDetails(credential, resourceId, subscriptionId) {
    const networkClient = new NetworkManagementClient(credential, subscriptionId);
    
    // Extract resource group and VNET name from resource ID
    const rgMatch = resourceId.match(/\/resourceGroups\/([^\/]+)/i);
    const vnetMatch = resourceId.match(/\/virtualNetworks\/([^\/]+)/i);
    
    if (!rgMatch || !vnetMatch) {
        throw new Error('Invalid virtual network resource ID');
    }
    
    const resourceGroup = rgMatch[1];
    const vnetName = vnetMatch[1];
    
    // Get VNET details
    const vnet = await networkClient.virtualNetworks.get(resourceGroup, vnetName);
    
    return {
        id: vnet.id,
        name: vnet.name,
        type: 'Virtual Network',
        location: vnet.location,
        resourceGroup,
        properties: {
            addressSpace: vnet.addressSpace.addressPrefixes,
            subnets: vnet.subnets ? vnet.subnets.map(subnet => ({
                id: subnet.id,
                name: subnet.name,
                addressPrefix: subnet.addressPrefix
            })) : [],
            enableDdosProtection: vnet.enableDdosProtection,
            provisioningState: vnet.provisioningState
        }
    };
}

/**
 * Get subnet details
 * @param {object} credential - Azure credential
 * @param {string} resourceId - Azure resource ID
 * @param {string} subscriptionId - Subscription ID
 * @returns {object} - Subnet details
 */
async function getSubnetDetails(credential, resourceId, subscriptionId) {
    const networkClient = new NetworkManagementClient(credential, subscriptionId);
    
    // Extract resource group, VNET name, and subnet name from resource ID
    const rgMatch = resourceId.match(/\/resourceGroups\/([^\/]+)/i);
    const vnetMatch = resourceId.match(/\/virtualNetworks\/([^\/]+)/i);
    const subnetMatch = resourceId.match(/\/subnets\/([^\/]+)/i);
    
    if (!rgMatch || !vnetMatch || !subnetMatch) {
        throw new Error('Invalid subnet resource ID');
    }
    
    const resourceGroup = rgMatch[1];
    const vnetName = vnetMatch[1];
    const subnetName = subnetMatch[1];
    
    // Get subnet details
    const subnet = await networkClient.subnets.get(resourceGroup, vnetName, subnetName);
    
    return {
        id: subnet.id,
        name: subnet.name,
        type: 'Subnet',
        resourceGroup,
        properties: {
            addressPrefix: subnet.addressPrefix,
            networkSecurityGroup: subnet.networkSecurityGroup ? subnet.networkSecurityGroup.id : null,
            routeTable: subnet.routeTable ? subnet.routeTable.id : null,
            serviceEndpoints: subnet.serviceEndpoints || [],
            delegations: subnet.delegations || [],
            privateEndpointNetworkPolicies: subnet.privateEndpointNetworkPolicies,
            privateLinkServiceNetworkPolicies: subnet.privateLinkServiceNetworkPolicies,
            provisioningState: subnet.provisioningState
        }
    };
}

/**
 * Get network interface details
 * @param {object} credential - Azure credential
 * @param {string} resourceId - Azure resource ID
 * @param {string} subscriptionId - Subscription ID
 * @returns {object} - Network interface details
 */
async function getNetworkInterfaceDetails(credential, resourceId, subscriptionId) {
    const networkClient = new NetworkManagementClient(credential, subscriptionId);
    
    // Extract resource group and NIC name from resource ID
    const rgMatch = resourceId.match(/\/resourceGroups\/([^\/]+)/i);
    const nicMatch = resourceId.match(/\/networkInterfaces\/([^\/]+)/i);
    
    if (!rgMatch || !nicMatch) {
        throw new Error('Invalid network interface resource ID');
    }
    
    const resourceGroup = rgMatch[1];
    const nicName = nicMatch[1];
    
    // Get NIC details
    const nic = await networkClient.networkInterfaces.get(resourceGroup, nicName);
    
    return {
        id: nic.id,
        name: nic.name,
        type: 'Network Interface',
        location: nic.location,
        resourceGroup,
        properties: {
            ipConfigurations: nic.ipConfigurations ? nic.ipConfigurations.map(ipConfig => ({
                name: ipConfig.name,
                privateIPAddress: ipConfig.privateIPAddress,
                privateIPAllocationMethod: ipConfig.privateIPAllocationMethod,
                subnet: ipConfig.subnet ? ipConfig.subnet.id : null,
                publicIPAddress: ipConfig.publicIPAddress ? ipConfig.publicIPAddress.id : null
            })) : [],
            networkSecurityGroup: nic.networkSecurityGroup ? nic.networkSecurityGroup.id : null,
            primary: nic.primary,
            enableAcceleratedNetworking: nic.enableAcceleratedNetworking,
            provisioningState: nic.provisioningState
        }
    };
}

/**
 * Get public IP details
 * @param {object} credential - Azure credential
 * @param {string} resourceId - Azure resource ID
 * @param {string} subscriptionId - Subscription ID
 * @returns {object} - Public IP details
 */
async function getPublicIPDetails(credential, resourceId, subscriptionId) {
    const networkClient = new NetworkManagementClient(credential, subscriptionId);
    
    // Extract resource group and public IP name from resource ID
    const rgMatch = resourceId.match(/\/resourceGroups\/([^\/]+)/i);
    const pipMatch = resourceId.match(/\/publicIPAddresses\/([^\/]+)/i);
    
    if (!rgMatch || !pipMatch) {
        throw new Error('Invalid public IP resource ID');
    }
    
    const resourceGroup = rgMatch[1];
    const pipName = pipMatch[1];
    
    // Get public IP details
    const pip = await networkClient.publicIPAddresses.get(resourceGroup, pipName);
    
    return {
        id: pip.id,
        name: pip.name,
        type: 'Public IP Address',
        location: pip.location,
        resourceGroup,
        properties: {
            ipAddress: pip.ipAddress,
            publicIPAllocationMethod: pip.publicIPAllocationMethod,
            publicIPAddressVersion: pip.publicIPAddressVersion,
            dnsSettings: pip.dnsSettings ? {
                domainNameLabel: pip.dnsSettings.domainNameLabel,
                fqdn: pip.dnsSettings.fqdn
            } : null,
            idleTimeoutInMinutes: pip.idleTimeoutInMinutes,
            provisioningState: pip.provisioningState
        }
    };
}

/**
 * Get NSG details
 * @param {object} credential - Azure credential
 * @param {string} resourceId - Azure resource ID
 * @param {string} subscriptionId - Subscription ID
 * @returns {object} - NSG details
 */
async function getNsgDetails(credential, resourceId, subscriptionId) {
    const networkClient = new NetworkManagementClient(credential, subscriptionId);
    
    // Extract resource group and NSG name from resource ID
    const rgMatch = resourceId.match(/\/resourceGroups\/([^\/]+)/i);
    const nsgMatch = resourceId.match(/\/networkSecurityGroups\/([^\/]+)/i);
    
    if (!rgMatch || !nsgMatch) {
        throw new Error('Invalid NSG resource ID');
    }
    
    const resourceGroup = rgMatch[1];
    const nsgName = nsgMatch[1];
    
    // Get NSG details
    const nsg = await networkClient.networkSecurityGroups.get(resourceGroup, nsgName);
    
    return {
        id: nsg.id,
        name: nsg.name,
        type: 'Network Security Group',
        location: nsg.location,
        resourceGroup,
        properties: {
            securityRules: nsg.securityRules ? nsg.securityRules.map(rule => ({
                name: rule.name,
                protocol: rule.protocol,
                sourceAddressPrefix: rule.sourceAddressPrefix,
                sourcePortRange: rule.sourcePortRange,
                destinationAddressPrefix: rule.destinationAddressPrefix,
                destinationPortRange: rule.destinationPortRange,
                access: rule.access,
                priority: rule.priority,
                direction: rule.direction
            })) : [],
            provisioningState: nsg.provisioningState
        }
    };
}

/**
 * Get virtual machine details
 * @param {object} credential - Azure credential
 * @param {string} resourceId - Azure resource ID
 * @param {string} subscriptionId - Subscription ID
 * @returns {object} - Virtual machine details
 */
async function getVirtualMachineDetails(credential, resourceId, subscriptionId) {
    const computeClient = new ComputeManagementClient(credential, subscriptionId);
    const networkClient = new NetworkManagementClient(credential, subscriptionId);
    
    // Extract resource group and VM name from resource ID
    const rgMatch = resourceId.match(/\/resourceGroups\/([^\/]+)/i);
    const vmMatch = resourceId.match(/\/virtualMachines\/([^\/]+)/i);
    
    if (!rgMatch || !vmMatch) {
        throw new Error('Invalid virtual machine resource ID');
    }
    
    const resourceGroup = rgMatch[1];
    const vmName = vmMatch[1];
    
    // Get VM details
    const vm = await computeClient.virtualMachines.get(resourceGroup, vmName);
    
    // Get network interfaces
    const networkInterfaces = [];
    if (vm.networkProfile && vm.networkProfile.networkInterfaces) {
        for (const nicRef of vm.networkProfile.networkInterfaces) {
            // Extract NIC resource group and name
            const nicRgMatch = nicRef.id.match(/\/resourceGroups\/([^\/]+)/i);
            const nicNameMatch = nicRef.id.match(/\/networkInterfaces\/([^\/]+)/i);
            
            if (nicRgMatch && nicNameMatch) {
                const nicRg = nicRgMatch[1];
                const nicName = nicNameMatch[1];
                
                try {
                    const nic = await networkClient.networkInterfaces.get(nicRg, nicName);
                    networkInterfaces.push({
                        id: nic.id,
                        name: nic.name,
                        primary: nic.primary,
                        ipConfigurations: nic.ipConfigurations ? nic.ipConfigurations.map(ipConfig => ({
                            privateIPAddress: ipConfig.privateIPAddress,
                            publicIPAddress: ipConfig.publicIPAddress ? ipConfig.publicIPAddress.id : null
                        })) : []
                    });
                } catch (error) {
                    // Continue if a specific NIC can't be retrieved
                    context.log.warn(`Could not retrieve NIC details: ${error.message}`);
                }
            }
        }
    }
    
    return {
        id: vm.id,
        name: vm.name,
        type: 'Virtual Machine',
        location: vm.location,
        resourceGroup,
        properties: {
            hardwareProfile: {
                vmSize: vm.hardwareProfile.vmSize
            },
            storageProfile: {
                imageReference: vm.storageProfile.imageReference ? {
                    publisher: vm.storageProfile.imageReference.publisher,
                    offer: vm.storageProfile.imageReference.offer,
                    sku: vm.storageProfile.imageReference.sku,
                    version: vm.storageProfile.imageReference.version
                } : null,
                osDisk: vm.storageProfile.osDisk ? {
                    osType: vm.storageProfile.osDisk.osType,
                    name: vm.storageProfile.osDisk.name,
                    createOption: vm.storageProfile.osDisk.createOption,
                    managedDisk: vm.storageProfile.osDisk.managedDisk ? {
                        storageAccountType: vm.storageProfile.osDisk.managedDisk.storageAccountType
                    } : null
                } : null
            },
            osProfile: vm.osProfile ? {
                computerName: vm.osProfile.computerName,
                adminUsername: vm.osProfile.adminUsername,
                linuxConfiguration: vm.osProfile.linuxConfiguration ? {
                    disablePasswordAuthentication: vm.osProfile.linuxConfiguration.disablePasswordAuthentication
                } : null,
                windowsConfiguration: vm.osProfile.windowsConfiguration ? {
                    enableAutomaticUpdates: vm.osProfile.windowsConfiguration.enableAutomaticUpdates
                } : null
            } : null,
            networkInterfaces,
            provisioningState: vm.provisioningState
        }
    };
}
