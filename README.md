---
page_type: sample
languages:
  - sql
products:
  - azure
  - vs-code
  - azure-sql-database
  - azure-web-apps
description: 'Full Stack Todo Sample app, with GraphQL support, using Hasura, Azure Web Apps, Vue.Js and Azure SQL'
urlFragment: 'azure-sql-db-rest-graphql-directus'
---

<!--
Guidelines on README format: https://review.docs.microsoft.com/help/onboard/admin/samples/concepts/readme-template?branch=master

Guidance on onboarding samples to docs.microsoft.com/samples: https://review.docs.microsoft.com/help/onboard/admin/samples/process/onboarding?branch=master

Taxonomies for products and languages: https://review.docs.microsoft.com/new-hope/information-architecture/metadata/taxonomies?branch=master
-->

# An Azure & Hasura Todo App

This application is setup to provide an example of using GraphQL with Vue.js, with Hasura providing GraphQL API Services via the Azure Cloud.

**NOTE** For more detail instructions, check out the blog entry that details this repository and the steps to get everything running.

## Features

This project framework provides the following features:

* Vue.js v3 Todo Application (in the root of this repo)
  * GraphQL Client code to the GraphQL API
* [The Hasura GraphQL API Deployment to Azure & Azure SQL](https://github.com/Adron/terrazura)
* Terraform for the infrastructure in Azure

## Prerequisites

The following are prerequisites to run the back end, initial deploy of infrastructure, and develop the application locally.

1. An Azure Account with the appropriate permissions to deploy applications, containers, and databases as needed by this application.
2. Azure CLI need to be installed and logged in for use.
3. Terraform, the CLI, needs to be installed locally with the appropriate environment variables set. See [env-var-notes](env-var-notes.md) for the short list of variables needed.

## Getting Started

For this app, deploy the code and run with `yarn run dev`, then point the various GraphQL calls (currently pointed at localhost:8080/v2/graphql) where the GraphQL API end point is deployed to. This GraphQL end point will be listed after the execution of the Terraform script as the `hasura_uri_path` variable.

Even though you won't need it for this example, the output variable `sqlserver_dsn` variable shows the full DSN connection string to the Azure SQL deployed in Azure.

### Todo App Quickstart

Change out the path of the URI paths to the GraphQL end point to reflect where your deployed API is located at. Then...

- yarn install
- yarn run dev
