import { readFileSync } from "fs";
import { parseEPCISXML, detectFormat } from "./server/epcis-xml-parser.ts";
import { format as utilFormat } from "node:util";
const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);


// Read sample XML file
const xmlContent = readFileSync("./sample-epcis.xml", "utf-8");

cliOut("Testing XML Parser...\n");

// Test format detection
const format = detectFormat(xmlContent);
cliOut(`Detected format: ${format}`);

// Test XML parsing
try {
  const jsonDoc = parseEPCISXML(xmlContent);
  cliOut("\nParsed EPCIS Document:");
  cliOut(JSON.stringify(jsonDoc, null, 2));

  cliOut(
    `\n✅ Success! Parsed ${jsonDoc.epcisBody.eventList.length} events`
  );
  jsonDoc.epcisBody.eventList.forEach((event, i) => {
    cliOut(`  Event ${i + 1}: ${event.type} at ${event.eventTime}`);
  });
} catch (error) {
  cliErr("\n❌ Error:", error.message);
  cliErr(error.stack);
}
