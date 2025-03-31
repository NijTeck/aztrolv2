# Azure Enterprise Manager

## Overview
Azure Enterprise Manager is a SaaS application designed to simplify the management and monitoring of Azure resources. It provides visualization and management capabilities for:

- **Network Management**: Visualize VNETs, Subnets, and network topology
- **Permissions Management**: View and manage RBAC (Role-Based Access Control)
- **Cost Management**: Monitor and analyze Azure resource costs
- **Policy Management**: Track policy compliance (optional feature)

## Project Structure
- `/frontend`: React.js frontend application
- `/backend`: Azure Functions backend services
- `/infra`: Infrastructure as Code (Bicep/ARM templates)

## Features

### Network Management
- Network topology visualization
- Resource details view
- Network troubleshooting tools

### Permissions Management
- Role assignments view
- Effective permissions analysis
- Role definition viewing

### Cost Management
- Current month cost overview
- Cost analysis by resource

## Getting Started

### Prerequisites
- VS Code (latest)
- Python 3.x
- Node.js/npm (latest LTS)
- Azure CLI (latest)
- Bicep CLI (latest)
- Azure Subscription

### Installation
1. Clone this repository
2. Set up the development environment
3. Configure Azure authentication
4. Run the application

## Development
This project follows a structured development approach with clear phases:
1. Project Setup and Foundational Components
2. Network Management Features
3. Permission Management Features
4. Cost Management Features
5. Deployment and Testing

## Authentication
The application uses Azure AD for authentication and authorization, implementing:
- Auth Code Grant with PKCE flow
- Role-based access control
- Azure Key Vault for secrets management
