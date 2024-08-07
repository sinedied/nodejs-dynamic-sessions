# ACA Dynamic Sessions with Node.js Playground

## Prerequisites
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [Node.js v20+](https://nodejs.org)
- [Azure Functions Core Tools](https://learn.microsoft.com/azure/azure-functions/functions-run-local?tabs=windows%2Cisolated-process%2Cnode-v4%2Cpython-v2%2Chttp-trigger%2Ccontainer-apps&pivots=programming-language-javascript#install-the-azure-functions-core-tools)

## Usage

### Setup the Node.js session pool

1. Login to Azure CLI
1. Create a resource group with the following command:
    ```bash
    az group create --name <resource-group-name> --location <location>
    ```
1. Get an access token with the following command:
    ```bash
    az account get-access-token --query accessToken
    ```
1. Create a `.env` file in `src/api` with the following content:
    ```bash
    RESOURCE_GROUP=
    SESSION_POOL_NAME=
    SUBSCRIPTION_ID=
    BEARER_TOKEN=
    ```
1. Open the file `src/api/sessions.http` and create a new sessions pool by sending the first request.
1. Add the endpoint of the created sessions pool to the `.env` file.
  ```bash
  POOL_MANAGEMENT_ENDPOINT=
  ```
1. Go to Azure Portal, find the created sessions pool, and open the `Access Control (IAM)` tab.
1. Add a new role assignment to your account: `Azure ContainerApps Session Executor`

### Run the app

Run the following commands in the root directory of the project:

1. `npm install`
1. `npm start`
1. Open `http://localhost:4200` in your browser
