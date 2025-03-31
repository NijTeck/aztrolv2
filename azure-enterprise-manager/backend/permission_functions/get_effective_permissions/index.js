const { DefaultAzureCredential } = require('@azure/identity');
const { AuthorizationManagementClient } = require('@azure/arm-authorization');

/**
 * Azure Function to get effective permissions
 * @param {object} context - Azure Functions context
 * @param {object} req - HTTP request
 */
module.exports = async function (context, req) {
    try {
        // Get parameters from query
        const principalId = req.query.principalId;
        const resourceId = req.query.resourceId;
        
        if (!principalId || !resourceId) {
            context.res = {
                status: 400,
                body: { error: "Missing required parameters: principalId and resourceId" }
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
        
        // Create AuthorizationManagementClient
        const authClient = new AuthorizationManagementClient(credential, subscriptionId);
        
        // Get role assignments for the principal at the resource scope
        const roleAssignments = await getRoleAssignmentsForPrincipal(authClient, principalId, resourceId);
        
        // Get effective permissions based on role assignments
        const effectivePermissions = await getEffectivePermissions(authClient, roleAssignments);
        
        // Return the effective permissions
        context.res = {
            status: 200,
            body: {
                principalId,
                resourceId,
                roleAssignments: roleAssignments.map(ra => ({
                    roleName: ra.roleName,
                    scope: ra.scope
                })),
                effectivePermissions
            }
        };
    } catch (error) {
        context.log.error(`Error getting effective permissions: ${error.message}`);
        
        context.res = {
            status: 500,
            body: { error: `Failed to get effective permissions: ${error.message}` }
        };
    }
};

/**
 * Extract subscription ID from resource ID
 * @param {string} resourceId - Azure resource ID
 * @returns {string} - Subscription ID
 */
function getSubscriptionIdFromResourceId(resourceId) {
    const match = resourceId.match(/\/subscriptions\/([^\/]+)/i);
    return match ? match[1] : '';
}

/**
 * Get role assignments for a principal at a resource scope
 * @param {object} authClient - AuthorizationManagementClient
 * @param {string} principalId - Principal ID
 * @param {string} resourceId - Resource ID
 * @returns {Array} - Role assignments
 */
async function getRoleAssignmentsForPrincipal(authClient, principalId, resourceId) {
    const roleAssignments = [];
    
    // Get role assignments at the resource scope
    const resourceScopeAssignments = await authClient.roleAssignments.listForScope(resourceId);
    
    // Filter assignments for the specified principal
    for (const assignment of resourceScopeAssignments) {
        if (assignment.principalId === principalId) {
            try {
                // Get role definition
                const roleDefinition = await authClient.roleDefinitions.getById(assignment.roleDefinitionId);
                
                roleAssignments.push({
                    id: assignment.id,
                    principalId: assignment.principalId,
                    roleDefinitionId: assignment.roleDefinitionId,
                    roleName: roleDefinition.roleName || 'Unknown Role',
                    scope: assignment.scope
                });
            } catch (error) {
                context.log.warn(`Could not retrieve role definition: ${error.message}`);
                roleAssignments.push({
                    id: assignment.id,
                    principalId: assignment.principalId,
                    roleDefinitionId: assignment.roleDefinitionId,
                    roleName: 'Unknown Role',
                    scope: assignment.scope
                });
            }
        }
    }
    
    // Check for inherited permissions from parent scopes
    // This is a simplified approach - in a real app, you'd check all parent scopes
    const parentScopes = getParentScopes(resourceId);
    
    for (const parentScope of parentScopes) {
        try {
            const parentScopeAssignments = await authClient.roleAssignments.listForScope(parentScope);
            
            for (const assignment of parentScopeAssignments) {
                if (assignment.principalId === principalId) {
                    try {
                        // Get role definition
                        const roleDefinition = await authClient.roleDefinitions.getById(assignment.roleDefinitionId);
                        
                        roleAssignments.push({
                            id: assignment.id,
                            principalId: assignment.principalId,
                            roleDefinitionId: assignment.roleDefinitionId,
                            roleName: roleDefinition.roleName || 'Unknown Role',
                            scope: assignment.scope,
                            inherited: true
                        });
                    } catch (error) {
                        context.log.warn(`Could not retrieve role definition: ${error.message}`);
                        roleAssignments.push({
                            id: assignment.id,
                            principalId: assignment.principalId,
                            roleDefinitionId: assignment.roleDefinitionId,
                            roleName: 'Unknown Role',
                            scope: assignment.scope,
                            inherited: true
                        });
                    }
                }
            }
        } catch (error) {
            context.log.warn(`Error checking parent scope ${parentScope}: ${error.message}`);
        }
    }
    
    return roleAssignments;
}

/**
 * Get parent scopes for a resource ID
 * @param {string} resourceId - Azure resource ID
 * @returns {Array} - Parent scopes
 */
function getParentScopes(resourceId) {
    const parentScopes = [];
    
    // Split the resource ID by '/'
    const parts = resourceId.split('/');
    
    // Build parent scopes
    for (let i = 3; i < parts.length; i += 2) {
        const parentScope = parts.slice(0, i + 1).join('/');
        parentScopes.push(parentScope);
    }
    
    // Remove the original resource ID from the list
    return parentScopes.filter(scope => scope !== resourceId);
}

/**
 * Get effective permissions based on role assignments
 * @param {object} authClient - AuthorizationManagementClient
 * @param {Array} roleAssignments - Role assignments
 * @returns {Array} - Effective permissions
 */
async function getEffectivePermissions(authClient, roleAssignments) {
    const effectivePermissions = new Set();
    
    for (const assignment of roleAssignments) {
        try {
            // Get role definition
            const roleDefinition = await authClient.roleDefinitions.getById(assignment.roleDefinitionId);
            
            // Add permissions from this role
            if (roleDefinition.permissions) {
                for (const permission of roleDefinition.permissions) {
                    if (permission.actions) {
                        for (const action of permission.actions) {
                            effectivePermissions.add(action);
                        }
                    }
                }
            }
        } catch (error) {
            context.log.warn(`Could not retrieve permissions for role: ${error.message}`);
        }
    }
    
    return Array.from(effectivePermissions).sort();
}
