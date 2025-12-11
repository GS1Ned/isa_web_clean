# ISA Research Findings - Data Sources & Automation

## GS1 Netherlands Data Sources

### GS1 NL API Developer Portal

- **URL**: https://gs1nl-api-acc-developer.gs1.nl/
- **Access**: Requires sign-in and API credentials
- **Key API**: Basic Product Data IN API - bulk GTIN registration
- **Authentication**: API Access Token required
- **Environment**: Test and production environments available
- **Output Formats**: Excel, PDF, GS1 GDSN XML, media files (TIFF, JPG, PDF)

### GS1 Data Exchange Services

1. **GS1 Data Source**: Product data sharing platform
2. **GS1 Data Pools**: GDSN-based data exchange
3. **GS1 Interface**: Request-based data retrieval from suppliers

### Available Data Types

- Product data (GTIN-based)
- Location/party details (GLN-based)
- Company information
- Healthcare uniform datasets (medical devices)
- Sustainability data
- Supply chain traceability data

### Standards Coverage

- GTIN (Global Trade Item Number)
- GLN (Global Location Number)
- EPCIS (Electronic Product Code Information Services)
- GS1 Digital Link
- GS1 Global Data Model (GDM)
- GDSN (Global Data Synchronization Network)

## EU Regulatory Data Sources

### Primary Sources (To Research)

- EUR-Lex: Official EU law database
- CELLAR: EU Publications Office repository
- European Commission legislative proposals
- ESMA, EBA, EIOPA regulatory databases
- National implementation trackers

## Next Research Steps

1. Investigate EUR-Lex API access and bulk download capabilities
2. Research CELLAR SPARQL endpoint for structured queries
3. Identify RSS feeds for regulatory updates
4. Explore web scraping strategies for non-API sources
5. Analyze data normalization requirements

## EUR-Lex Web Services

### SOAP API

- **Protocol**: SOAP-based web service
- **Access**: Free after registration at EUR-Lex
- **Registration**: Required via EURLEX-HELPDESK@publications.europa.eu
- **Query Capabilities**: Expert search syntax, full-text search
- **Output Format**: XML
- **Limitation**: Cannot directly download document files (only metadata)
- **Documentation**: Web Service User Manual v2.01 available
- **WSDL**: https://eur-lex.europa.eu/eurlex-ws?wsdl

### Document Download Methods

1. **CELLAR RESTful API**: Download documents by identifier
2. **Stable Links**: URL construction for direct document access
3. **RSS Feeds**: Predefined or customized feeds for updates

## CELLAR (Publications Office Repository)

### Overview

- **Type**: Semantic repository with Linked Data architecture
- **Content**: EU legal acts, publications, reference datasets
- **Technology**: RDF, SPARQL, semantic web standards
- **Services Supported**: EUR-Lex, EU Publications, EU Vocabularies

### SPARQL Endpoint

- **URL**: https://publications.europa.eu/webapi/rdf/sparql
- **Access**: Public, no authentication required
- **Query Language**: SPARQL 1.1
- **Output Formats**: HTML, XML, JSON, Turtle, RDF/XML, N-Triples, CSV, TSV
- **Timeout**: Configurable (default limits apply)
- **Ontology**: CDM (Common Data Model) - http://publications.europa.eu/ontology/cdm#
- **Use Cases**: Automated data access, research, bulk queries

### Key Features

- **Scalable**: Designed for large-scale data storage and retrieval
- **Interoperable**: Standards-based framework for data sharing
- **Machine-readable**: Full programmatic access via SPARQL
- **RSS Feeds**: Available for change notifications
- **Act-by-Act Publishing**: Official Journal moving to act-by-act format (Oct 2023)

### Data Model

- Based on semantic ontologies (CDM)
- Linked Data principles
- Supports complex queries across relationships
- Metadata-rich structure

## Automation Strategy Insights

### Strengths

1. **CELLAR SPARQL**: Best option for bulk automated queries
2. **RSS Feeds**: Real-time update notifications
3. **RESTful API**: Document retrieval by identifier
4. **Structured Data**: RDF/semantic format enables precise queries

### Challenges

1. **EUR-Lex SOAP**: Requires registration, XML parsing
2. **Rate Limits**: Need to implement respectful crawling
3. **Data Normalization**: Multiple formats require transformation
4. **Document Files**: Separate download step required

### Recommended Approach

1. Use CELLAR SPARQL for bulk metadata queries
2. Subscribe to RSS feeds for real-time updates
3. Use RESTful API for document downloads
4. Implement caching layer to minimize API calls
5. Store normalized data in local database
