# ISA User Guide

## 1. Introduction

ISA (Intelligent Standards Architect) is a web based application that helps organisations bridge European sustainability regulations with GS1 standards and supply chain data.

ISA focuses on three core goals:

1. Make complex sustainability regulations such as CSRD, ESRS and EU Green Deal instruments understandable and navigable.
2. Translate regulatory requirements into concrete GS1 data attributes and technical standards.
3. Provide practical tools that support Digital Product Passport workflows and ESG reporting.

This guide is written for four primary user roles:

- Compliance officer or legal counsel
- Product manager or portfolio owner
- Data specialist or master data steward
- Sustainability or ESG reporting lead

Each role can use ISA in a slightly different way while sharing the same data and regulatory backbone.

## 2. Getting Started

### 2.1 Accessing ISA

ISA is typically deployed as a Manus project. Your organisation administrator will share the ISA URL. For example:

- `https://isa.manus.space`
- `https://isa.yourcompany.com`

To sign in:

1. Open the ISA URL in a modern browser.
2. Log in using your organisation account or Manus account, depending on the configuration.
3. After authentication you will be redirected to the ISA home screen.

### 2.2 First Login Experience

On first login, ISA usually presents:

- A welcome banner with a short description of the current environment.
- A navigation sidebar with sections for ESG Hub, Standards, News and DPP tools.
- A contextual callout suggesting a first workflow such as “Explore CSRD and ESRS coverage” or “Start a DPP mapping”.

Screenshot placeholder:

![ISA home screen with navigation sidebar and ESG overview cards](./images/placeholder_home_screen.png "ISA home screen placeholder")

### 2.3 Main Navigation Overview

The main sections of ISA are usually:

- **ESG Hub**  
  Browse EU regulations, directives and standards and see how they relate to GS1 data.
- **Standards and Mappings**  
  Explore GS1 standards, attribute sets and mapping libraries used in ISA.
- **News Hub**  
  View curated regulatory and GS1 news, visualised on a timeline.
- **DPP Tools**  
  Workflows for building and validating Digital Product Passports.
- **Data Quality**  
  Validation tools for GTIN, GLN and related identifiers.
- **Help and Documentation**  
  Access this user guide, quick start and FAQ.

Your deployment might expose additional experimental features; these will be documented in the release notes.

## 3. Core Concepts

### 3.1 Regulations and ESRS Datapoints

ISA ingests structured information about regulations such as CSRD and ESRS. Regulations are represented as:

- Regulations and directives (for example CSRD or ESPR).
- Standards with datapoints (for example ESRS E1 or S1 with granular disclosure requirements).
- Links between legal text, datapoints and technical data attributes.

In practice this means that when you open an ESRS datapoint in ISA you see:

- The official datapoint identifier and label.
- The regulatory context and references.
- Mapped GS1 attributes that can carry the required information.
- Coverage indicators showing whether the datapoint is already supported by GS1.

Screenshot placeholder:

![ESRS datapoint detail page with GS1 mappings and coverage indicators](./images/placeholder_esrs_datapoint.png "ESRS datapoint detail placeholder")

### 3.2 GS1 Standards and Attributes

ISA uses GS1 standards as the data language to implement regulatory requirements. Examples include:

- GDSN attribute sets for product master data.
- EPCIS event fields for supply chain traceability.
- Digital Link URI structures for product identifiers and DPP access.
- GLN for locations and parties.

ISA maintains curated mapping libraries that relate ESRS datapoints, GPC categories and other regulatory artefacts to concrete GS1 attributes.

### 3.3 Digital Product Passport (DPP)

ISA positions DPP as a cross cutting use case which relies on:

- Regulatory requirements from ESPR, delegated acts and product category rules.
- GS1 identification keys (GTIN, GLN), standards (Digital Link, EPCIS) and attributes.
- Company specific data models and systems.

The DPP tools in ISA help you prototype and plan DPP data models by:

- Showing which regulatory datapoints are relevant for a product.
- Showing which GS1 attributes and standards can cover those datapoints.
- Highlighting gaps where additional data or standard extensions are needed.

## 4. ESG Hub

### 4.1 Overview Page

The ESG Hub entry page gives a high level overview of:

- Regulations covered (CSRD, ESRS topics, EUDR, ESPR and others).
- Coverage summaries that show how many datapoints are mapped to GS1.
- Sector specific shortcuts such as “Food sector view” or “Retail view”.

Screenshot placeholder:

![ESG Hub overview cards for CSRD, ESRS, DPP and EUDR](./images/placeholder_esg_hub.png "ESG Hub overview placeholder")

From here you can drill down into:

- A regulation centric view (“show me all E1 datapoints and their mappings”).
- A topic centric view (“show me all S1 datapoints related to workforce safety”).
- A sector centric view (“show me relevant datapoints for the food sector”).

### 4.2 Regulation Browser

The regulation browser typically offers:

- A list or tree of regulations and standards on the left.
