/**
 * CELLAR Diagnostic Test
 *
 * Debug why CELLAR queries are returning 0 results
 * 
 * NOTE: These tests require connectivity to the EU CELLAR SPARQL endpoint.
 * They are skipped by default for CI stability. Run manually with:
 *   pnpm vitest run server/cellar-diagnostic.test.ts
 * 
 * To enable: change describe.skip to describe
 */

import { describe, it, expect } from "vitest";
import axios from "axios";

const CELLAR_ENDPOINT = "https://publications.europa.eu/webapi/rdf/sparql";
const CDM_NS = "http://publications.europa.eu/ontology/cdm#";

// Skip all CELLAR diagnostic tests by default - they require live EU endpoint connectivity
describe.skip("CELLAR Diagnostic", () => {
  it("should test basic SPARQL query", async () => {
    // Simplest possible query - just count acts
    const query = `
      PREFIX cdm: <${CDM_NS}>
      
      SELECT (COUNT(?act) AS ?count)
      WHERE {
        ?act cdm:work_id_document ?actID .
      }
      LIMIT 1
    `;

    console.log("\n=== Testing Basic CELLAR Query ===");
    console.log("Query:", query);

    try {
      const response = await axios.post(
        CELLAR_ENDPOINT,
        `query=${encodeURIComponent(query)}`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/sparql-results+json",
          },
          timeout: 30000,
        }
      );

      console.log("Status:", response.status);
      console.log("Response:", JSON.stringify(response.data, null, 2));

      expect(response.status).toBe(200);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }, 60000);

  it("should test query for recent regulations", async () => {
    const query = `
      PREFIX cdm: <${CDM_NS}>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      
      SELECT ?act ?actID
      WHERE {
        ?act cdm:work_id_document ?actID .
        ?act cdm:resource_legal_date_entry-into-force ?date .
        FILTER(?date >= "2020-01-01"^^xsd:date)
      }
      LIMIT 10
    `;

    console.log("\n=== Testing Recent Regulations Query ===");

    try {
      const response = await axios.post(
        CELLAR_ENDPOINT,
        `query=${encodeURIComponent(query)}`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/sparql-results+json",
          },
          timeout: 30000,
        }
      );

      console.log("Status:", response.status);
      console.log(
        "Results count:",
        response.data.results?.bindings?.length || 0
      );

      if (response.data.results?.bindings?.length > 0) {
        console.log(
          "Sample result:",
          JSON.stringify(response.data.results.bindings[0], null, 2)
        );
      }

      expect(response.status).toBe(200);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }, 60000);

  it("should test query with known CELEX ID", async () => {
    // CSRD - we know this exists
    const celexId = "32022L2464";

    const query = `
      PREFIX cdm: <${CDM_NS}>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      
      SELECT ?act ?title ?date
      WHERE {
        ?act cdm:work_id_document "${celexId}" .
        OPTIONAL { ?act rdfs:label ?title } .
        OPTIONAL { ?act cdm:resource_legal_date_entry-into-force ?date } .
      }
    `;

    console.log("\n=== Testing Known CELEX ID Query (CSRD) ===");

    try {
      const response = await axios.post(
        CELLAR_ENDPOINT,
        `query=${encodeURIComponent(query)}`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/sparql-results+json",
          },
          timeout: 30000,
        }
      );

      console.log("Status:", response.status);
      console.log("Results:", JSON.stringify(response.data, null, 2));

      expect(response.status).toBe(200);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }, 60000);
});
