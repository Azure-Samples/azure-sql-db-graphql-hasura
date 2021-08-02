This blog entry will provide several key examples of using Azure, Hasura, GraphQL, and Terraform to setup a todo list application. In this example, the todo application is just an example application to show how Azure and Hasura can be used to provide a scalable, fast, and reliable platform to build your application with.

I've broken this blog entry into several distinct sections to show how each of these key technologies can work together or independently!

Sections

* Immutable Infrastructure: Azure & Terraform
* Database & Servers: SQL Server & Hasura
* The Todo Application: Vuejs

These sections then have a follow up on next steps for architectural suggestions, deployment options, and other ideas on how to setup Hasura GraphQL API Services with SQL Server in existing environments, in hybrid cloud environments, and related further steps.

## Azure & Terraform

Prerequisites

* Azure Account & CLI - For this you'll need to have the Azure CLI installed and authenticated with your Azure account.
* Terraform CLI - The Terraform CLI needs to be installed.

Starting out I've broken out the Terraform HCL (HashiCorp Configuration Language) into individual files in the `terraform` directory. I did this to specifically highlight the provider connection, resource group, servers, databases, database firewalls, and the Hasura API individually.

The `main.tf` file is used to setup the provider, connection, and resource group that will be used in Azure. I've rounded out the file with variables that will be passed in during execution, used for database server names, user accounts, and related information. Finally there are two output variables which print out at the end of execution showing the Hasura API path to navigate to and the SQL Server DSN. I've set these up to make it easy, once things are deployed, to get right into the Hasura Concole or connect directly to the SQL Server database with a DSN.

``` javascript
terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      version = "2.41.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "terrazuragrp" {
  name = "terrazura_grp"
  location = "westus2"
}

variable "sqlserver" {}

variable "username" {}

variable "password" {}

variable "server" {}

variable "apiport" {}

variable "pgdatabase" {}

variable "sqlserverdb" {}

variable "sqluid" {}

variable "sqlpwd" {}

output "hasura_uri_path" {
  value="${azurerm_container_group.hasura.fqdn}:${var.apiport}"
}

output "sqlserver_dsn" {
  value="Driver={ODBC Driver 17 for SQL Server};Server=${azurerm_sql_server.sqlserver.fully_qualified_domain_name};Database=${var.sqlserverdb};UID=${var.sqluid};PWD=${var.sqlpwd};"
}
```

Next up are the servers needed for the databases. Hasura uses Postgres as a metadata store, so that database server is included here, as well as our primary database which is SQL Server for our todo application. For both servers they're using Azure's RDBMS managed options, and created within the resource group and set to the same location as the resource group.

``` javascript
resource "azurerm_postgresql_server" "terrazuraserver" {
  name = var.server
  location = azurerm_resource_group.terrazuragrp.location
  resource_group_name = azurerm_resource_group.terrazuragrp.name
  sku_name = "B_Gen5_2"

  storage_mb = "5120"
  backup_retention_days = 7
  geo_redundant_backup_enabled = false
  auto_grow_enabled = true

  administrator_login = var.username
  administrator_login_password = var.password
  ssl_enforcement_enabled = true
  version = "11"
}

resource "azurerm_sql_server" "sqlserver" {
  name                         = "terrazurasqlserver"
  resource_group_name          = azurerm_resource_group.terrazuragrp.name
  location                     = azurerm_resource_group.terrazuragrp.location
  version                      = "12.0"
  administrator_login          = "4dm1n157r470r"
  administrator_login_password = "4-v3ry-53cr37-p455w0rd"
}
```

With the database servers listed creation the databases need created. For this, again the resource group and location are set within the settings along with editions, character sets, and collation.

``` javascript
resource "azurerm_sql_database" "azuresqldb" {
  name                             = var.sqlserverdb
  resource_group_name              = azurerm_resource_group.terrazuragrp.name
  location                         = azurerm_resource_group.terrazuragrp.location
  server_name                      = azurerm_sql_server.sqlserver.name
  edition                          = "Standard"
  requested_service_objective_name = "S0"
}

resource "azurerm_postgresql_database" "terrazuradb" {
  name = var.pgdatabase
  resource_group_name = azurerm_resource_group.terrazuragrp.name
  server_name = azurerm_postgresql_server.terrazuraserver.name
  charset = "UTF8"
  collation = "English_United States.1252"
}
```

In Azure the databases need opened up to where the container services instances will be located, and those firewall settings to do that look like this.

``` javascript
resource "azurerm_sql_firewall_rule" "main" {
  name                = "AlllowAzureServices"
  resource_group_name = azurerm_resource_group.terrazuragrp.name
  server_name         = azurerm_sql_server.sqlserver.name
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "0.0.0.0"
}

resource "azurerm_postgresql_firewall_rule" "terrazurarule" {
  end_ip_address = "0.0.0.0"
  start_ip_address = "0.0.0.0"
  name = "allow-azure-internal"
  resource_group_name = azurerm_resource_group.terrazuragrp.name
  server_name = azurerm_postgresql_server.terrazuraserver.name
}
```

The Hasura GraphQL API will then be provided in the `hasura-api.tf` file. In this configuration the various elements are set, hosting on Linux, ip address set to public, a DNS name label set for use in the domain name, then the container is setup. The container includes - all that is needed for a minimal setup - just 0.5 CPI and 1.5 memory. The image used for this example app is `hasura/graphql-engine:v2.0.1`, port 8080, which is passed in via variable, is set and then finally the environment variables. I've also set the console to `false`, as toward the end of this deployment we can run the console locally if we want to use it.

``` javascript
resource "azurerm_container_group" "hasura" {
  location = azurerm_resource_group.terrazuragrp.location
  name = "terrazura-hasura-api"
  os_type = "Linux"
  resource_group_name = azurerm_resource_group.terrazuragrp.name
  ip_address_type = "public"
  dns_name_label = "terrazuradatalayer"

  container {
    cpu = "0.5"
    image = "hasura/graphql-engine:v2.0.1"
    memory = "1.5"
    name = "hasura-data-layer-api"

    ports {
      port = var.apiport
      protocol = "TCP"
    }

    environment_variables = {
      HASURA_GRAPHQL_SERVER_PORT = var.apiport
      HASURA_GRAPHQL_ENABLE_CONSOLE = false
    }
    secure_environment_variables = {
      HASURA_GRAPHQL_DATABASE_URL = "postgres://${var.username}%40${azurerm_postgresql_server.terrazuraserver.name}:${var.password}@${azurerm_postgresql_server.terrazuraserver.fqdn}:5432/${var.pgdatabase}"
      HASURA_SQLSERVER_URL = "Driver={ODBC Driver 17 for SQL Server};Server=${azurerm_sql_server.sqlserver.fully_qualified_domain_name};Database=${var.sqlserverdb};UID=${var.sqluid};PWD=${var.sqlpwd};"
    }
  }

  tags = {
    environment = "datalayer"
  }
}
```

All of this infrastructure to deploy is then deployed with Terraform using the script file `terraformapply.sh`. Of course, you could just execute the script manually if you want to tweak it any.

``` bash
echo "Starting terraform initialization."

terraform init

echo "Starting terraform of $DATABASESERVER."

terraform apply \
  -var 'sqlserver='$DATABASESERVER'' \
  -var 'server=terrazuraserver' \
  -var 'username='$PUSERNAME'' \
  -var 'password='$PPASSWORD'' \
  -var 'sqluid='$SQLUID'' \
  -var 'sqlpwd='$SQLPWD'' \
  -var 'pgdatabase=terrazuradb' \
  -var 'sqlserverdb='$DATABASE'' \
  -var 'apiport=8080'
```

Once that is completed all of the infrastructure is in place. However there is a little bit more to all this that Hasura provides and I've included it in the script.

IMAGE TBD + SCRIPT

The tables and schema of the database that is needed for the todo app, I've included using the Hasura CLI tooling. These migrations are located within the `hasura` directory of the repo. From that directory,

COMPLETE STEPS FOR MIGRATIONS

## Hasura GraphQL API using SQL Server

DISCUSS GENERAL PROPERTIES OF THE API SERVER IN CONTEXT OF ACS.

## Vuejs Todo Application

CONTENTS WILL BE COMPLETED FOR MUTTAIONS RELEASE 4 SQL SERVER.

## The Next Steps

*Advancing Application Development with Azure & Hasura GraphQL APIs.*

Once you've got this example up and running, it provides a good base to work from to determine where and what could be done in your specific use case and your systems environment. If you've got some elements in Azure, or just want a quick Hasura Console interface to work with, or have a hybrid cloud setup in your environment here are some next steps that might help out.

## Hasura Cloud

If you'd like to try out the Hasura Console and migrations flow, one great options is the [Hasura Cloud](#) which you can connect to Azure or to your local databases in a hubrid environment. Just navigate over to [Hasura.io](#) to check out that option. It's also a great environment for prototyping, ongoing development, experiments, production, and related environments without the need to manage the Hasura API containers and infrastruture.

## Hybrid Options

If you've got hosted SQL Server in your local environment, you can also use the Docker container to deploy Hasura locally and have it work near your database (SQL Server, Postgres, etc) in a kind of DMZ, and pipe back to Azure via your hybrid cloud setup.

## Summary

The variations, architectures, and related possibilities are expansive. Whether directly deployed to Azure, using the Hasura Console, piping via a hybrid cloud setup via VPN into your Azure Network, or other arrangements the Azure and Hasura GraphQL API can help bring GraphQL to use and speed up your application development extensively.
