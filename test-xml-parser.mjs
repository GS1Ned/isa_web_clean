import { readFileSync } from "fs";
import { parseEPCISXML, detectFormat } from "./server/epcis-xml-parser.ts";

// Read sample XML file
const xmlContent = readFileSync("./sample-epcis.xml", "utf-8");

console.log("Testing XML Parser...\n");

// Test format detection
const format = detectFormat(xmlContent);
console.log(`Detected format: ${format}`);

// Test XML parsing
try {
  const jsonDoc = parseEPCISXML(xmlContent);
  console.log("\nParsed EPCIS Document:");
  console.log(JSON.stringify(jsonDoc, null, 2));

  console.log(
    `\n✅ Success! Parsed ${jsonDoc.epcisBody.eventList.length} events`
  );
  jsonDoc.epcisBody.eventList.forEach((event, i) => {
    console.log(`  Event ${i + 1}: ${event.type} at ${event.eventTime}`);
  });
} catch (error) {
  console.error("\n❌ Error:", error.message);
  console.error(error.stack);
}
