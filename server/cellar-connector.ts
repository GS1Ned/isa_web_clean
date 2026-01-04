/**
 * CELLAR SPARQL Connector
 *
 * Connects to the EU Publications Office CELLAR SPARQL endpoint
 * to retrieve metadata about EU legal acts and regulations.
 *
 * CELLAR uses the CDM (Common Data Model) ontology with WEMI structure:
 * - WORK: Abstract idea of a legal resource
 * - EXPRESSION: Language version of a work
 * - MANIFESTATION: Physical embodiment (PDF, HTML, etc.)
 * - ITEM: Single exemplar with unique identifier
 */

import axios, { AxiosInstance } from "axios";
import { serverLogger } from "./_core/logger-wiring";


// CELLAR SPARQL endpoint (public, no authentication required)
const CELLAR_SPARQL_ENDPOINT =
  "https://publications.europa.eu/webapi/rdf/sparql";

// CDM ontology namespace
const CDM_NS = "http://publications.europa.eu/ontology/cdm#";

/**
 * SPARQL query result binding
 */
export interface SPARQLBinding {
  type: "uri" | "literal" | "bnode";
  value: string;
  "xml:lang"?: string;
  datatype?: string;
}

/**
 * SPARQL query result row
 */
export interface SPARQLResult {
  [variable: string]: SPARQLBinding;
}

/**
 * SPARQL query response
 */
export interface SPARQLResponse {
  head: {
    vars: string[];
  };
  results: {
    bindings: SPARQLResult[];
  };
}

/**
 * EU Legal Act metadata from CELLAR
 */
export interface EULegalAct {
  uri: string;
  celexId?: string;
  title?: string;
  dateEntryIntoForce?: Date;
  dateEndOfValidity?: Date;
  inForce: boolean;
  resourceType?: string;
  language?: string;
}

/**
 * CELLAR SPARQL Connector Class
 */
export class CellarConnector {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: CELLAR_SPARQL_ENDPOINT,
      timeout: 30000, // 30 second timeout
      headers: {
        Accept: "application/sparql-results+json",
        "Content-Type": "application/sparql-query",
      },
    });
  }

  /**
   * Execute a SPARQL query against CELLAR endpoint
   */
  async executeSPARQL(query: string): Promise<SPARQLResponse> {
    try {
      const response = await this.client.post("", query, {
        params: {
          format: "application/sparql-results+json",
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`CELLAR SPARQL query failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Retrieve EU legal acts that entered into force in a specific year and are still in force
   */
  async getActsInForceByYear(year: number): Promise<EULegalAct[]> {
    const query = `
      PREFIX cdm: <${CDM_NS}>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      
      SELECT ?act ?actID ?dateEntryIntoForce
      WHERE {
        ?act cdm:resource_legal_in-force "true"^^xsd:boolean .
        ?act cdm:resource_legal_date_entry-into-force ?dateEntryIntoForce .
        ?act cdm:work_id_document ?actID .
        FILTER(?dateEntryIntoForce >= "${year}-01-01"^^xsd:date && ?dateEntryIntoForce < "${year + 1}-01-01"^^xsd:date)
      }
      ORDER BY ?dateEntryIntoForce
      LIMIT 1000
    `;

    const response = await this.executeSPARQL(query);
    return this.parseActsFromSPARQL(response);
  }

  /**
   * Retrieve EU legal acts by keyword search in title
   */
  async searchActsByKeyword(
    keyword: string,
    limit = 100
  ): Promise<EULegalAct[]> {
    const query = `
      PREFIX cdm: <${CDM_NS}>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      
      SELECT DISTINCT ?act ?actID ?title ?dateEntryIntoForce ?inForce
      WHERE {
        ?act cdm:work_id_document ?actID .
        ?act cdm:resource_legal_in-force ?inForce .
        OPTIONAL { ?act cdm:resource_legal_date_entry-into-force ?dateEntryIntoForce } .
        OPTIONAL { ?act rdfs:label ?title } .
        FILTER(CONTAINS(LCASE(STR(?title)), "${keyword.toLowerCase()}") || CONTAINS(LCASE(STR(?actID)), "${keyword.toLowerCase()}"))
      }
      ORDER BY DESC(?dateEntryIntoForce)
      LIMIT ${limit}
    `;

    const response = await this.executeSPARQL(query);
    return this.parseActsFromSPARQL(response);
  }

  /**
   * Retrieve acts by CELEX identifier
   */
  async getActByCelex(celexId: string): Promise<EULegalAct | null> {
    const query = `
      PREFIX cdm: <${CDM_NS}>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      
      SELECT ?act ?title ?dateEntryIntoForce ?dateEndOfValidity ?inForce ?resourceType
      WHERE {
        ?act cdm:work_id_document "${celexId}" .
        ?act cdm:resource_legal_in-force ?inForce .
        OPTIONAL { ?act cdm:resource_legal_date_entry-into-force ?dateEntryIntoForce } .
        OPTIONAL { ?act cdm:resource_legal_date_end-of-validity ?dateEndOfValidity } .
        OPTIONAL { ?act rdfs:label ?title } .
        OPTIONAL { ?act cdm:work_has_resource-type ?resourceType } .
      }
      LIMIT 1
    `;

    const response = await this.executeSPARQL(query);
    const acts = this.parseActsFromSPARQL(response);
    return acts.length > 0 ? acts[0] : null;
  }

  /**
   * Retrieve ALL recent regulations (last N years) without filtering
   * This is more reliable than keyword-based ESG filtering
   */
  async getAllRecentRegulations(
    yearsBack = 5,
    limit = 500
  ): Promise<EULegalAct[]> {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - yearsBack;

    const query = `
      PREFIX cdm: <${CDM_NS}>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      
      SELECT DISTINCT ?act ?actID ?title ?dateEntryIntoForce ?inForce
      WHERE {
        ?act cdm:work_id_document ?actID .
        ?act cdm:resource_legal_in-force ?inForce .
        ?act cdm:resource_legal_date_entry-into-force ?dateEntryIntoForce .
        OPTIONAL { ?act rdfs:label ?title } .
        FILTER(?dateEntryIntoForce >= "${startYear}-01-01"^^xsd:date)
        FILTER(REGEX(?actID, "celex:3[0-9]{4}[LR][0-9]", "i"))
      }
      ORDER BY DESC(?dateEntryIntoForce)
      LIMIT ${limit}
    `;

    const response = await this.executeSPARQL(query);
    return this.parseActsFromSPARQL(response);
  }

  /**
   * Retrieve recent ESG-related regulations (last N years)
   */
  async getESGRegulations(yearsBack = 5): Promise<EULegalAct[]> {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - yearsBack;

    // ESG-related keywords
    const keywords = [
      "sustainability",
      "environmental",
      "social",
      "governance",
      "ESG",
      "climate",
      "carbon",
      "green",
      "circular economy",
      "due diligence",
      "reporting",
      "disclosure",
      "taxonomy",
      "CSRD",
      "ESRS",
      "SFDR",
    ];

    const keywordFilter = keywords
      .map(k => `CONTAINS(LCASE(STR(?title)), "${k.toLowerCase()}")`)
      .join(" || ");

    const query = `
      PREFIX cdm: <${CDM_NS}>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      
      SELECT DISTINCT ?act ?actID ?title ?dateEntryIntoForce ?inForce
      WHERE {
        ?act cdm:work_id_document ?actID .
        ?act cdm:resource_legal_in-force ?inForce .
        ?act cdm:resource_legal_date_entry-into-force ?dateEntryIntoForce .
        OPTIONAL { ?act rdfs:label ?title } .
        FILTER(?dateEntryIntoForce >= "${startYear}-01-01"^^xsd:date)
        FILTER(${keywordFilter})
      }
      ORDER BY DESC(?dateEntryIntoForce)
      LIMIT 500
    `;

    const response = await this.executeSPARQL(query);
    return this.parseActsFromSPARQL(response);
  }

  /**
   * Parse SPARQL response into EULegalAct objects
   */
  private parseActsFromSPARQL(response: SPARQLResponse): EULegalAct[] {
    return response.results.bindings.map(binding => {
      // Strip "celex:" prefix if present
      let celexId = binding.actID?.value;
      if (celexId && celexId.startsWith("celex:")) {
        celexId = celexId.substring(6); // Remove "celex:" prefix
      }

      const act: EULegalAct = {
        uri: binding.act?.value || "",
        celexId,
        title: binding.title?.value,
        inForce: binding.inForce?.value === "true",
        resourceType: binding.resourceType?.value,
        language: binding.title?.["xml:lang"],
      };

      if (binding.dateEntryIntoForce) {
        act.dateEntryIntoForce = new Date(binding.dateEntryIntoForce.value);
      }

      if (binding.dateEndOfValidity) {
        act.dateEndOfValidity = new Date(binding.dateEndOfValidity.value);
      }

      return act;
    });
  }

  /**
   * Test connection to CELLAR endpoint
   */
  async testConnection(): Promise<boolean> {
    try {
      const query = `
        PREFIX cdm: <${CDM_NS}>
        SELECT (COUNT(?act) as ?count)
        WHERE {
          ?act cdm:resource_legal_in-force "true"^^<http://www.w3.org/2001/XMLSchema#boolean> .
        }
        LIMIT 1
      `;
      const response = await this.executeSPARQL(query);
      return response.results.bindings.length > 0;
    } catch (error) {
      serverLogger.error("CELLAR connection test failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const cellarConnector = new CellarConnector();
