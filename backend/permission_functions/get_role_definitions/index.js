const { DefaultAzureCredential } = require('@azure/identity');
const { AuthorizationManagementClient } = require('@azure/arm-authorization');

/**
 * Azure Function to get role definitions
 * @param {object} context - Azure Functions context
 * @param {object} req - HTTP request
 */
module.exports = async function (context, req) {
    try {
        // Get subscription ID from query parameters (optional)
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
        
        // Create AuthorizationManagementClient
        const authClient = new AuthorizationManagementClient(credential, subscriptionId);
        
        // Get role definitions
        const roleDefinitions = await authClient.roleDefinitions.list(
            `/subscriptions/${subscriptionId}`
        );
        
        // Transform role definitions to a more usable format
        const transformedDefinitions = transformRoleDefinitions(roleDefinitions);
        
        // Return the role definitions
        context.res = {
            status: 200,
            body: transformedDefinitions
        };
    } catch (error) {
        context.log.error(`Error getting role definitions: ${error.message}`);
        
        context.res = {
            status: 500,
            body: { error: `Failed to get role definitions: ${error.message}` }
        };
    }
};

/**
 * Transform role definitions to a more usable format
 * @param {Array} roleDefinitions - Role definitions
 * @returns {Array} - Transformed role definitions
 */
function transformRoleDefinitions(roleDefinitions) {
    return roleDefinitions.map(definition => {
        // Extract permissions
        const permissions = definition.permissions ? definition.permissions.map(permission => ({
            actions: permission.actions || [],
            notActions: permission.notActions || [],
            dataActions: permission.dataActions || [],
            notDataActions: permission.notDataActions || []
        })) : [];
        
        // Return transformed definition
        return {
            id: definition.id,
            name: definition.name,
            roleName: definition.roleName,
            description: definition.description,
            type: definition.type,
            permissions,
            assignableScopes: definition.assignableScopes || []
        };
    });
}
