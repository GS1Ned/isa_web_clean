# ISA Dataset Registry v1.0 - LOCKED

**Status:** LOCKED  
**Version:** 1.0.0  
**Lock Date:** 2025-12-13  
**Lock Reason:** MVP canonical dataset registry finalized

---

## Registry Contents

This registry contains **9 canonical datasets** covering all ISA MVP requirements:

### EU Regulations & Disclosures (1 dataset)
1. **esrs.datapoints.ig3** - ESRS Datapoints (EFRAG IG3)
   - 1,186 datapoints
   - Status: mvp

### GS1 Netherlands/Benelux (4 datasets)
2. **gs1nl.benelux.diy_garden_pet.v3.1.33** - DIY/Garden/Pets Data Model
   - 3,009 attributes
   - Status: mvp

3. **gs1nl.benelux.fmcg.v3.1.33.5** - FMCG Data Model
   - 473 attributes
   - Status: mvp

4. **gs1nl.benelux.healthcare.v3.1.33** - Healthcare (ECHO) Data Model
   - 185 attributes
   - Status: mvp

5. **gs1nl.benelux.validation_rules.v3.1.33.4** - Validation Rules
   - 847 rules, 1,055 code lists
   - Status: mvp

### GS1 Global Standards (4 datasets)
6. **gdsn.current.v3.1.32** - GDSN Current Data Model
   - 1,194 product classes, 2,049 attributes, 1,050 validation rules
   - Status: mvp

7. **gs1.ctes_kdes** - CTEs and KDEs for ESG
   - 50 records
   - Status: mvp

8. **eu.dpp.identification_rules** - EU DPP Identification Rules
   - 18 rules, 8 components
   - Status: mvp

9. **gs1.cbv_digital_link** - CBV and Digital Link Vocabularies
   - 24 CBV vocabularies, 60 Digital Link types
   - Status: mvp

---

## Total Coverage

- **11,197 records** ingested across 9 datasets
- **100% MVP requirements** covered
- **All canonical domains** represented:
  - Regulations_and_Obligations
  - Disclosures_and_Datapoints
  - GS1_Standards_and_Specs
  - GS1_Sector_Data_Models
  - Product_and_Packaging
  - Identifiers_and_Digital_Link
  - Vocabularies_and_Taxonomies
  - Assurance_and_Auditability

---

## Lock Policy

**No modifications allowed** to v1.0 registry without version bump.

### Allowed Operations
- ✅ Read registry
- ✅ Query datasets
- ✅ Generate reports

### Prohibited Operations
- ❌ Add datasets (requires v1.1)
- ❌ Remove datasets (requires v1.1)
- ❌ Modify dataset metadata (requires v1.1)
- ❌ Change dataset IDs (requires major version bump)

---

## Version History

| Version | Date | Changes | Datasets |
|---------|------|---------|----------|
| 1.0.0 | 2025-12-13 | Initial MVP registry locked | 9 |
| 0.1.0 | 2025-12-13 | Initial registry with GS1 NL datasets | 4 |

---

## Future Versions

### v1.1 (Planned)
- Add ESRS XBRL Taxonomy v2024-08-30
- Add additional sector models as needed
- Add archival/superseded dataset tracking

### v2.0 (Future)
- Add real-time API access metadata
- Add dataset lineage graphs
- Add automated refresh scheduling

---

**Registry File:** `data/metadata/dataset_registry.json`  
**Schema File:** `data/metadata/dataset_registry.schema.json`

---

*This lock file ensures registry stability for ISA MVP production use.*
