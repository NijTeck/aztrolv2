const { DefaultAzureCredential } = require('@azure/identity');
const { CostManagementClient } = require('@azure/arm-costmanagement');

/**
 * Azure Function to get cost trend data
 * @param {object} context - Azure Functions context
 * @param {object} req - HTTP request
 */
module.exports = async function (context, req) {
    try {
        // Get subscription ID and period from query parameters
        const subscriptionId = req.query.subscriptionId;
        const period = req.query.period || "Last30Days"; // Last30Days, Last3Months, Last12Months
        
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
        
        // Map period to timeframe and granularity
        let timeframe, granularity;
        switch (period) {
            case "Last30Days":
                timeframe = "Custom";
                granularity = "Daily";
                break;
            case "Last3Months":
                timeframe = "Custom";
                granularity = "Monthly";
                break;
            case "Last12Months":
                timeframe = "Custom";
                granularity = "Monthly";
                break;
            default:
                timeframe = "MonthToDate";
                granularity = "Daily";
        }
        
        // Calculate date range based on period
        const endDate = new Date();
        let startDate;
        
        switch (period) {
            case "Last30Days":
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);
                break;
            case "Last3Months":
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            case "Last12Months":
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 12);
                break;
            default:
                startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        }
        
        // Format dates for API
        const fromDate = startDate.toISOString().split('T')[0];
        const toDate = endDate.toISOString().split('T')[0];
        
        // Define query for cost trend
        const query = {
            type: "Usage",
            timeframe: timeframe,
            timePeriod: {
                from: fromDate,
                to: toDate
            },
            dataset: {
                granularity: granularity,
                aggregation: {
                    totalCost: {
                        name: "Cost",
                        function: "Sum"
                    }
                },
                grouping: []
            }
        };
        
        // Get cost trend data
        const result = await costClient.query.usage(scope, query);
        
        // Extract cost trend data
        const costTrend = [];
        
        if (result && result.rows && result.rows.length > 0) {
            // Get column index for date
            let dateColumnIndex = -1;
            if (result.properties && result.properties.columns) {
                dateColumnIndex = result.properties.columns.findIndex(col => col.type === "DateTime");
            }
            
            if (dateColumnIndex >= 0) {
                for (const row of result.rows) {
                    const cost = row[0];
                    const date = row[dateColumnIndex];
                    
                    costTrend.push({
                        date,
                        cost
                    });
                }
            }
        }
        
        // Sort by date (ascending)
        costTrend.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Get currency
        let currency = "USD";
        if (result && result.properties && result.properties.columns) {
            const costColumn = result.properties.columns.find(col => col.name === "Cost");
            if (costColumn && costColumn.type === "Number") {
                currency = costColumn.currency || "USD";
            }
        }
        
        // Return the cost trend data
        context.res = {
            status: 200,
            body: {
                costTrend,
                currency,
                period,
                fromDate,
                toDate,
                subscriptionId
            }
        };
    } catch (error) {
        context.log.error(`Error getting cost trend: ${error.message}`);
        
        context.res = {
            status: 500,
            body: { error: `Failed to get cost trend: ${error.message}` }
        };
    }
};
