# Azure Container App Deployment Script
param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$Location,
    
    [Parameter(Mandatory=$true)]
    [string]$ContainerAppName,
    
    [Parameter(Mandatory=$true)]
    [string]$RegistryName,
    
    [Parameter(Mandatory=$true)]
    [string]$RegistryUsername,
    
    [Parameter(Mandatory=$true)]
    [SecureString]$RegistryPassword,
    
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentName,
    
    [Parameter(Mandatory=$true)]
    [string]$TenantId,
    
    [Parameter(Mandatory=$true)]
    [string]$ClientId,
    
    [Parameter(Mandatory=$true)]
    [string]$ClientSecret,
    
    [Parameter(Mandatory=$true)]
    [string]$SubscriptionId
)

# Ensure we're logged in
Write-Host "Checking Azure login status..."
$account = az account show | ConvertFrom-Json
if (-not $account) {
    Write-Host "Not logged in. Please run 'az login' first."
    exit 1
}

# Set the subscription
Write-Host "Setting subscription to $SubscriptionId..."
az account set --subscription $SubscriptionId

# Create resource group if it doesn't exist
Write-Host "Creating/updating resource group..."
az group create --name $ResourceGroupName --location $Location

# Create Container Registry if it doesn't exist
Write-Host "Creating/updating Container Registry..."
az acr create --resource-group $ResourceGroupName --name $RegistryName --sku Basic --admin-enabled true

# Get the registry credentials
Write-Host "Getting registry credentials..."
$registryCredentials = az acr credential show --name $RegistryName | ConvertFrom-Json
$registryUsername = $registryCredentials.username
$registryPassword = $registryCredentials.passwords[0].value

# Create Container Apps Environment if it doesn't exist
Write-Host "Creating/updating Container Apps Environment..."
az containerapp env create --name $EnvironmentName --resource-group $ResourceGroupName --location $Location

# Build and push the Docker image
Write-Host "Building and pushing Docker image..."
$imageTag = "$RegistryName.azurecr.io/$ContainerAppName:$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Build the Next.js application
Write-Host "Building Next.js application..."
npm run build

# Create Dockerfile
Write-Host "Creating Dockerfile..."
@"
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/next.config.js ./
COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
"@ | Out-File -FilePath "Dockerfile" -Encoding UTF8

# Build and push the Docker image
Write-Host "Building and pushing Docker image..."
docker build -t $imageTag .
az acr login --name $RegistryName
docker push $imageTag

# Deploy to Container Apps
Write-Host "Deploying to Container Apps..."
az containerapp create `
    --name $ContainerAppName `
    --resource-group $ResourceGroupName `
    --environment $EnvironmentName `
    --registry-server "$RegistryName.azurecr.io" `
    --registry-username $registryUsername `
    --registry-password $registryPassword `
    --target-port 3000 `
    --ingress external `
    --query properties.configuration.ingress.fqdn `
    --env-vars `
        AZURE_TENANT_ID=$TenantId `
        AZURE_CLIENT_ID=$ClientId `
        AZURE_CLIENT_SECRET=$ClientSecret `
        NEXT_PUBLIC_API_URL="https://aztrol-functions.azurewebsites.net" `
    --image $imageTag

Write-Host "Deployment completed successfully!"

# #!/usr/bin/env pwsh
# # Azure Container App Deployment Script for Azure Enterprise Manager
# param(
#     [Parameter(Mandatory=$true) ]
#     [string]$ResourceGroupName,
    
#     [Parameter(Mandatory=$true)]
#     [string]$Location,
    
#     [Parameter(Mandatory=$true)]
#     [string]$ContainerAppName,
    
#     [Parameter(Mandatory=$true)]
#     [string]$RegistryName,
    
#     [Parameter(Mandatory=$true)]
#     [string]$EnvironmentName,
    
#     [Parameter(Mandatory=$false)]
#     [string]$TenantId,
    
#     [Parameter(Mandatory=$false)]
#     [string]$ClientId,
    
#     [Parameter(Mandatory=$true)]
#     [string]$SubscriptionId,
    
#     [Parameter(Mandatory=$false)]
#     [switch]$CreateAppRegistration,
    
#     [Parameter(Mandatory=$false)]
#     [string]$AppName = "AzureEnterpriseManager"
# )

# # Ensure we're logged in
# Write-Host "Checking Azure login status..."
# $account = az account show | ConvertFrom-Json
# if (-not $account) {
#     Write-Host "Not logged in. Please run 'az login' first."
#     exit 1
# }

# # Set the subscription
# Write-Host "Setting subscription to $SubscriptionId..."
# az account set --subscription $SubscriptionId

# # Create or get Azure AD application if requested
# if ($CreateAppRegistration) {
#     Write-Host "Creating/updating Azure AD application registration..."
    
#     # Check if TenantId is provided
#     if (-not $TenantId) {
#         $TenantId = $account.tenantId
#         Write-Host "Using current tenant ID: $TenantId"
#     }
    
#     # Check if application already exists
#     $existingApp = az ad app list --display-name $AppName | ConvertFrom-Json
    
#     if ($existingApp) {
#         Write-Host "Application '$AppName' already exists. Using existing application."
#         $ClientId = $existingApp[0].appId
#         Write-Host "Client ID: $ClientId"
#     } else {
#         Write-Host "Creating new application registration '$AppName'..."
#         $redirectUri = "https://$ContainerAppName.$Location.azurecontainerapps.io"
        
#         # Create the application
#         $newApp = az ad app create --display-name $AppName --web-redirect-uris $redirectUri | ConvertFrom-Json
#         $ClientId = $newApp.appId
        
#         Write-Host "Application created successfully."
#         Write-Host "Client ID: $ClientId"
#         Write-Host "Redirect URI: $redirectUri"
        
#         # Create service principal for the application
#         Write-Host "Creating service principal for the application..."
#         az ad sp create --id $ClientId
        
#         # Add API permissions (Microsoft Graph) 
#         Write-Host "Adding API permissions..."
#         az ad app permission add --id $ClientId --api 00000003-0000-0000-c000-000000000000 --api-permissions e1fe6dd8-ba31-4d61-89e7-88639da4683d=Scope
        
#         # Grant admin consent for the permissions
#         Write-Host "Granting admin consent for permissions..."
#         az ad app permission admin-consent --id $ClientId
#     }
# } else {
#     # Validate that ClientId and TenantId are provided if not creating app registration
#     if (-not $ClientId -or -not $TenantId) {
#         Write-Host "Error: ClientId and TenantId are required when not creating a new app registration."
#         Write-Host "Please provide these parameters or use -CreateAppRegistration switch."
#         exit 1
#     }
# }

# # Create resource group if it doesn't exist
# Write-Host "Creating/updating resource group..."
# az group create --name $ResourceGroupName --location $Location

# # Create Container Registry if it doesn't exist
# Write-Host "Creating/updating Container Registry..."
# az acr create --resource-group $ResourceGroupName --name $RegistryName --sku Basic --admin-enabled true

# # Get the registry credentials
# Write-Host "Getting registry credentials..."
# $registryCredentials = az acr credential show --name $RegistryName | ConvertFrom-Json
# $registryUsername = $registryCredentials.username
# $registryPassword = $registryCredentials.passwords[0].value

# # Create Container Apps Environment if it doesn't exist
# Write-Host "Creating/updating Container Apps Environment..."
# az containerapp env create --name $EnvironmentName --resource-group $ResourceGroupName --location $Location

# # Build and push the Docker image
# Write-Host "Building and pushing Docker image..."
# $imageTag = "$RegistryName.azurecr.io/$ContainerAppName:$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# # Build the Docker image
# Write-Host "Building Docker image..."
# docker build -t $imageTag -f ./Dockerfile .

# # Push the Docker image
# Write-Host "Pushing Docker image to registry..."
# az acr login --name $RegistryName
# docker push $imageTag

# # Deploy to Container Apps
# Write-Host "Deploying to Container Apps..."
# az containerapp create `
#     --name $ContainerAppName `
#     --resource-group $ResourceGroupName `
#     --environment $EnvironmentName `
#     --registry-server "$RegistryName.azurecr.io" `
#     --registry-username $registryUsername `
#     --registry-password $registryPassword `
#     --target-port 3000 `
#     --ingress external `
#     --query properties.configuration.ingress.fqdn `
#     --env-vars `
#         "REACT_APP_CLIENT_ID=$ClientId" `
#         "REACT_APP_TENANT_ID=$TenantId" `
#         "REACT_APP_REDIRECT_URI=https://$ContainerAppName.$Location.azurecontainerapps.io" `
#     --image $imageTag

# Write-Host "Deployment completed successfully!"
