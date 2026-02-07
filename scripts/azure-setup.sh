#!/usr/bin/env bash
# Create Azure Database for PostgreSQL (Flexible Server) and database for PLC Jira.
# Prerequisites: Azure CLI installed and logged in (az login)
#
# Usage:
#   1. Edit the variables below (RESOURCE_GROUP, SERVER_NAME, ADMIN_PASSWORD, etc.)
#   2. ./scripts/azure-setup.sh
#   3. Copy the printed DATABASE_URL into backend/.env

set -e

# --- Edit these ---
RESOURCE_GROUP=plc-jira-rg
LOCATION=eastus
SERVER_NAME=plc-jira-db
ADMIN_USER=plcadmin
ADMIN_PASSWORD=ChangeMe123!
DB_NAME=plc_jira
# ------------------

echo "Creating resource group: $RESOURCE_GROUP"
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output none

echo "Creating PostgreSQL Flexible Server (this may take a few minutes)..."
az postgres flexible-server create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$SERVER_NAME" \
  --location "$LOCATION" \
  --admin-user "$ADMIN_USER" \
  --admin-password "$ADMIN_PASSWORD" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 15 \
  --public-access 0.0.0.0 \
  --output none

echo "Creating database: $DB_NAME"
az postgres flexible-server db create \
  --resource-group "$RESOURCE_GROUP" \
  --server-name "$SERVER_NAME" \
  --database-name "$DB_NAME" \
  --output none

HOST=$(az postgres flexible-server show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$SERVER_NAME" \
  --query fullyQualifiedDomainName -o tsv)

echo ""
echo "Done. Add this to backend/.env:"
echo ""
echo "DATABASE_URL=postgresql://${ADMIN_USER}:${ADMIN_PASSWORD}@${HOST}:5432/${DB_NAME}?sslmode=require"
echo ""
echo "Then run: cd backend && alembic upgrade head && python scripts/seed.py"
