const { DefaultAzureCredential } = require('@azure/identity');
const { CostManagementClient } = require('@azure/arm-costmanagement');

/**
 * Azure Function to get cost breakdown by resource type
 * @param {object} context - Azure Functions context
 * @param {object} req - HTTP request
 */
module.exports = async function (context, req) {
    try {
        // Get subscription ID and timeframe from query parameters
        const subscriptionId = req.query.subscriptionId;
        const timeframe = req.query.timeframe || "MonthToDate";
        
        if (!subscriptionId) {
            context.res = {
                status: 400,
                body: { error: "Missing required parameter: subscriptionId" }
            };
            return;
        }

        // Authenticate with DefaultAzureCredential
        const credential = new DefaultAzureCredential();
        
        // Create CostManagementClient
        const costClient = new CostManagementClient(credential);
        
        // Define scope
        const scope = `subscriptions/${subscriptionId}`;
        
        // Define query for cost breakdown by resource type
        const query = {
            type: "Usage",
            timeframe: timeframe,
            dataset: {
                granularity: "None",
                aggregation: {
                    totalCost: {
                        name: "Cost",
                        function: "Sum"
                    }
                },
                grouping: [
                    {
                        type: "Dimension",
                        name: "ResourceType"
                    }
                ]
            }
        };
        
        // Get cost breakdown data
        const result = await costClient.query.usage(scope, query);
        
        // Extract cost breakdown
        const costBreakdown = [];
        let totalCost = 0;
        
        if (result && result.rows && result.rows.length > 0) {
            for (const row of result.rows) {
                const cost = row[0];
                const resourceType = row[1];
                
                totalCost += cost;
                
                costBreakdown.push({
                    resourceType,
                    cost
                });
            }
        }
        
        // Calculate percentages
        for (const item of costBreakdown) {
            item.percentage = totalCost > 0 ? (item.cost / totalCost) * 100 : 0;
        }
        
        // Sort by cost (descending)
        costBreakdown.sort((a, b) => b.cost - a.cost);
        
        // Get currency
        let currency = "USD";
        if (result && result.properties && result.properties.columns) {
            const costColumn = result.properties.columns.find(col => col.name === "Cost");
            if (costColumn && costColumn.type === "Number") {
                currency = costColumn.currency || "USD";
            }
        }
        
        // Return the cost breakdown data
        context.res = {
            status: 200,
            body: {
                costBreakdown,
                totalCost,
                currency,
                timeframe,
                subscriptionId
            }
        };
    } catch (error) {
        context.log.error(`Error getting cost breakdown: ${error.message}`);
        
        context.res = {
            status: 500,
            body: { error: `Failed to get cost breakdown: ${error.message}` }
        };
    }
};
