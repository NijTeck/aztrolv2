# Azure Enterprise Manager - Testing Guide

This guide provides instructions for testing the Azure Enterprise Manager application after deployment.

## Prerequisites

Before testing, ensure you have:

1. Successfully deployed the application using the instructions in `DEPLOYMENT.md`
2. Access to an Azure account with appropriate permissions
3. The URL of your deployed application

## Testing Process

### 1. Authentication Testing

1. Open the application URL in a browser
2. Verify you're redirected to the Azure AD login page
3. Sign in with your Azure AD credentials
4. Confirm you're redirected back to the application
5. Verify your user information appears in the navigation bar

**Expected Result**: Successful authentication and access to the application dashboard.

### 2. Network Management Testing

#### 2.1 Network Topology Visualization

1. Navigate to the Network page
2. Enter a subscription ID in the input field
3. Verify the network topology visualization loads
4. Check that VNETs and subnets are displayed correctly
5. Test the interactive features (zoom, pan, click on resources)

**Expected Result**: Visual representation of your Azure network topology.

#### 2.2 Resource Details

1. Click on a resource in the network topology
2. Verify the resource details panel opens
3. Check that all resource properties are displayed correctly

**Expected Result**: Detailed information about the selected resource.

#### 2.3 Network Troubleshooting Tools

1. Navigate to the IP Flow Verification tool
2. Enter the required information (subscription ID, resource group, etc.)
3. Submit the form and verify results are displayed
4. Repeat for the Next Hop tool

**Expected Result**: Accurate troubleshooting results for the specified network configuration.

### 3. Permission Management Testing

#### 3.1 Role Assignments

1. Navigate to the Permissions page
2. Select a resource group from the dropdown
3. Verify role assignments are displayed in the table

**Expected Result**: List of role assignments for the selected resource group.

#### 3.2 Effective Permissions

1. Navigate to the Effective Permissions tool
2. Enter a principal ID and resource ID
3. Submit the form and verify results are displayed

**Expected Result**: List of effective permissions for the specified principal on the resource.

#### 3.3 Role Definitions

1. Navigate to the Role Definitions section
2. Enter a subscription ID
3. Verify role definitions are loaded
4. Select a role and check that its details are displayed

**Expected Result**: Detailed information about Azure role definitions.

### 4. Cost Management Testing

#### 4.1 Cost Overview

1. Navigate to the Cost page
2. Enter a subscription ID
3. Verify the current month cost is displayed

**Expected Result**: Total cost for the current month.

#### 4.2 Cost Breakdown

1. Navigate to the Cost Breakdown section
2. Enter a subscription ID and select a timeframe
3. Verify the cost breakdown by resource type is displayed

**Expected Result**: Cost distribution across different resource types.

#### 4.3 Cost Trend

1. Navigate to the Cost Trend section
2. Enter a subscription ID and select a period
3. Verify the cost trend data is displayed

**Expected Result**: Cost trend over the selected time period.

## Troubleshooting Common Issues

### Authentication Issues

- Verify the Azure AD application is configured correctly
- Check that the redirect URI matches your deployed application URL
- Ensure the application has the necessary API permissions

### Data Retrieval Issues

- Verify you have the appropriate permissions in Azure
- Check that you're using valid subscription IDs
- Ensure the Azure resources you're trying to access exist

### Visualization Issues

- Check browser console for JavaScript errors
- Verify you're using a modern browser (Chrome, Edge, Firefox)
- Try clearing browser cache and cookies

## Reporting Issues

If you encounter issues that you cannot resolve:

1. Take screenshots of the error
2. Note the steps to reproduce the issue
3. Check browser console for any error messages
4. Document the expected vs. actual behavior
