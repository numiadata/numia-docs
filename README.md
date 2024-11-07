# WriteDocs Template

The WriteDocs Template is the foundation for creating and deploying documentation portals using the WriteDocs solution. It comes with everything you need to get started quickly.

## Getting Started

Welcome to the WriteDocs documentation guide. Follow the instructions below to learn how to create, deploy, and take your documentation to the highest level with WriteDocs.

### Requirements

WriteDocs uses GitHub to integrate your docs with your code, and make source control effortless. Therefore, make sure you have the following requirements checked before getting started:

- [x] GitHub account
- [x] GitHub organization
- [x] Code editor, such as Visual Studio Code.

### Step 1: Create a repository from the WriteDocs template on GitHub

Start by creating a new repository in your GitHub organization using the [WriteDocs Template](https://github.com/WriteDocs/WriteDocs-template) provided on GitHub. When creating the repository, use the **`[yourcompanyname]-docs`** standard to define the repository name. This will give you a structured starting point to build your documentation quickly.

### Step 2: Connect your repository to the WriteDocs app

Once your documentation repository is created, follow the steps below to connect the [WriteDocs App](https://github.com/apps/WriteDocs-app) to this repository. This connection ensures that WriteDocs automatically generates and deploys your documentation.

1. Access the [WriteDocs App](https://github.com/apps/WriteDocs-app) on GitHub.
2. Click **Install**.
3. Select **Only select repositories** and look for the documentation repository created in Step 1.

With these simple steps, WriteDocs will automatically deploy your documentation.

### Step 3: Access your documentation

Intially, your documentation will be available at **`[yourcompanyname].docs.writedocs.io`**, using the WriteDocs subdomain.

> If you are in the Pro plan, you can add a custom domain to your documentation. For additional information, send and email to integration@writechoice.io and our team will be happy to help you set up your custom domain.

### Step 4: Customize your documentation (config.json)

WriteDocs provides you with a `config.json` file in your documentation repository where you can quickly customize the appearance and structure of your documentation. You can find more information about setting up this file on the [Global Settings](https://docs.writedocs.io/global-settings/) page.

### Step 5: Update your documentation

When you push changes to the `main` branch, WriteDocs will automatically update and deploy your documentation.

> If you don't have much experience in contributing to GitHub projects or using a doc-as-code approach, you can check our [Beginners Guide](https://docs.writedocs.io/beginners-guide) that covers the basics of working with Git and using a code editor to create docs.

## Using the WriteDocs Template

The WriteDocs template includes all the essential components to deploy your documentation portal. Below is an overview of the repository structure and how to use it:

```
|-- config.json
|-- homepage.html
|-- reference/
|-- media/
|-- docs/
```

The table below provides instructions on how to use each file and directory available:

| **File/Directory** | **Description**                                                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `config.json`      | All configurations and customizations of your documentation portal are done through this file. Customize appearance, navbar and sidebar structures, colors, and logos here.            |
| `homepage.html`    | WriteDocs uses the content from this file to generate the homepage of your documentation.                                                                                              |
| `docs/`            | Place all [MDX](https://mdxjs.com/) files in this directory to generate your documentation pages. Organize the files according to the desired structure of your documentation sidebar. |
| `reference/`       | Upload your OpenAPI files here to generate interactive API pages where customers can test your APIs.                                                                                   |
| `media/`           | Store all images used in your documentation in this directory. You can reference these images when writing your documentation.                                                         |

## Explore Additional Features

For detailed information on how to use all the features offered by WriteDocs, refer to the [WriteDocs documentation](https://docs.writedocs.io).
