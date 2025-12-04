import { CellarConnector } from './cellar-connector';

async function debugTitles() {
  const connector = new CellarConnector();
  const acts = await connector.getAllRecentRegulations(2, 10);

  console.log('Sample legal acts from CELLAR:');
  acts.slice(0, 5).forEach(act => {
    console.log(`\nCELEX: ${act.celexId}`);
    console.log(`Title: ${act.title || 'NO TITLE'}`);
    console.log(`In Force: ${act.inForce}`);
  });

  process.exit(0);
}

debugTitles();
