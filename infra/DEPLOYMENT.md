# Azure Enterprise Manager - Deployment Guide

This guide provides instructions for deploying the Azure Enterprise Manager application to Azure Container Apps.

## Prerequisites

Before deploying, ensure you have the following:

1. **Azure CLI** installed and configured
2. **Docker** installed and running
3. **PowerShell** (version 7.0 or later recommended)
4. An active **Azure subscription**
5. **Azure AD application** registered (you already have this with the provided Client ID and Tenant ID)

## Deployment Files

The deployment package includes:

- **Dockerfile**: Defines the container image for the application
- **deploy.ps1**: PowerShell script to automate the deployment process

## Deployment Steps

### 1. Prepare Your Environment

Ensure you're logged into Azure CLI:

```bash
az login
