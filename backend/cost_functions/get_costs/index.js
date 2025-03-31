const { DefaultAzureCredential } = require('@azure/identity');
const { CostManagementClient } = require('@azure/arm-costmanagement');

/**
 * Azure Function to get current month cost data
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
        
        // Create CostManagementClient
        const costClient = new CostManagementClient(credential);
        
        // Define query parameters for current month costs
        const scope = `subscriptions/${subscriptionId}`;
        const timeframe = "MonthToDate";
        
        // Define query for aggregated cost
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
                grouping: []
            }
        };
        
        // Get cost data
        const result = await costClient.query.usage(scope, query);
        
        // Extract total cost
        let totalCost = 0;
        if (result && result.rows && result.rows.length > 0) {
            totalCost = result.rows[0][0];
        }
        
        // Get currency
        let currency = "USD";
        if (result && result.properties && result.properties.columns) {
            const costColumn = result.properties.columns.find(col => col.name === "Cost");
            if (costColumn && costColumn.type === "Number") {
                currency = costColumn.currency || "USD";
            }
        }
        
        // Return the cost data
        context.res = {
            status: 200,
            body: {
                totalCost,
                currency,
                timeframe,
                subscriptionId
            }
        };
    } catch (error) {
        context.log.error(`Error getting cost data: ${error.message}`);
        
        context.res = {
            status: 500,
            body: { error: `Failed to get cost data: ${error.message}` }
        };
    }
};
