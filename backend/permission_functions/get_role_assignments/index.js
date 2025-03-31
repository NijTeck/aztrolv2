const { DefaultAzureCredential } = require('@azure/identity');
const { AuthorizationManagementClient } = require('@azure/arm-authorization');

/**
 * Azure Function to get role assignments
 * @param {object} context - Azure Functions context
 * @param {object} req - HTTP request
 */
module.exports = async function (context, req) {
    try {
        // Get scope from query parameters
        const scope = req.query.scope;
        
        if (!scope) {
            context.res = {
                status: 400,
                body: { error: "Missing required parameter: scope" }
            };
            return;
        }

        // Extract subscription ID from scope
        const subscriptionId = getSubscriptionIdFromScope(scope);
        
        if (!subscriptionId) {
            context.res = {
                status: 400,
                body: { error: "Invalid scope format" }
            };
            return;
        }

        // Authenticate with DefaultAzureCredential
        const credential = new DefaultAzureCredential();
        
        // Create AuthorizationManagementClient
        const authClient = new AuthorizationManagementClient(credential, subscriptionId);
        
        // Get role assignments for the scope
        const roleAssignments = await authClient.roleAssignments.listForScope(scope);
        
        // Transform role assignments to include principal and role names
        const transformedAssignments = await transformRoleAssignments(authClient, roleAssignments);
        
        // Return the role assignments
        context.res = {
            status: 200,
            body: transformedAssignments
        };
    } catch (error) {
        context.log.error(`Error getting role assignments: ${error.message}`);
        
        context.res = {
            status: 500,
            body: { error: `Failed to get role assignments: ${error.message}` }
        };
    }
};

/**
 * Extract subscription ID from scope
 * @param {string} scope - Azure resource scope
 * @returns {string} - Subscription ID
 */
function getSubscriptionIdFromScope(scope) {
    const match = scope.match(/\/subscriptions\/([^\/]+)/i);
    return match ? match[1] : '';
}

/**
 * Transform role assignments to include principal and role names
 * @param {object} authClient - AuthorizationManagementClient
 * @param {Array} roleAssignments - Role assignments
 * @returns {Array} - Transformed role assignments
 */
async function transformRoleAssignments(authClient, roleAssignments) {
    const transformedAssignments = [];
    
    for (const assignment of roleAssignments) {
        try {
            // Get role definition
            const roleDefinitionId = assignment.roleDefinitionId;
            const roleDefMatch = roleDefinitionId.match(/\/roleDefinitions\/([^\/]+)/i);
            const roleDefId = roleDefMatch ? roleDefMatch[1] : '';
            
            let roleName = 'Unknown Role';
            if (roleDefId) {
                try {
                    const roleDefinition = await authClient.roleDefinitions.getById(roleDefinitionId);
                    roleName = roleDefinition.roleName || 'Unknown Role';
                } catch (error) {
                    context.log.warn(`Could not retrieve role definition: ${error.message}`);
                }
            }
            
            // Get principal name (simplified - in a real app, you'd use Microsoft Graph API)
            const principalId = assignment.principalId;
            const principalName = principalId; // In a real app, resolve this to actual name
            
            transformedAssignments.push({
                id: assignment.id,
                principalId: principalId,
                principalName: principalName,
                roleDefinitionId: roleDefinitionId,
                roleName: roleName,
                scope: assignment.scope,
                type: assignment.type
            });
        } catch (error) {
            context.log.warn(`Error transforming role assignment: ${error.message}`);
            // Include the raw assignment if transformation fails
            transformedAssignments.push(assignment);
        }
    }
    
    return transformedAssignments;
}



