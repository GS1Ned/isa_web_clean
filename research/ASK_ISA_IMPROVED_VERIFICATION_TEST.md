# Ask ISA Improved Claim Verification Test Results

**Date:** 2026-01-25
**Test Query:** "Which gaps exist for CSRD and ESRS in DIY?"

## Comparison: Before vs After System Prompt Improvement

| Metric | Before (v2.0) | After (v2.1) | Improvement |
|--------|---------------|--------------|-------------|
| Claim Verification Rate | 8% (1/12) | 14% (3/22) | +75% relative |
| Total Claims Detected | 12 | 22 | +83% |
| Authority Score | 94% | 94% | Same |
| Sources Used | 5 | 5 | Same |

## Observations

### Inline Citation Examples Found in Response (v2.1)
The improved system prompt is generating more inline citations:

1. "ESRS requires disclosure of Scope 1, 2, and 3 emissions [Source 1]"
2. "companies need product-level traceability data, such as material composition and origin [Source 1]"
3. "This requires the implementation of GS1 standards like Global Location Numbers (GLN) and Electronic Product Code Information Services (EPCIS) [Source 1]"
4. "DIY products involve diverse materials, leading to specific gaps in reporting on resource use and circular economy (ESRS E4) and pollution (ESRS E5) [Source 3]"
5. "The upcoming Packaging and Packaging Waste Regulation (PPWR) demands specific data on packaging material composition and recyclability [Source 1]"
6. "While ESRS S1 covers the company's own workforce [Source 5], DIY companies often rely heavily on complex supply chains [Source 3]"
7. "Companies often rely on supplier audits, but CSRD requires continuous due diligence [Source 2]"
8. "DIY companies must prioritize investment in product-level data infrastructure [Source 1]"
9. "Implement GS1 standards (GTIN, GLN) to uniquely identify products and locations [Source 1]"
10. "Utilize EPCIS to capture and share event data [Source 1]"
11. "Ensure that the granular product data collected for DPP/PPWR compliance is integrated into the corporate reporting systems used for CSRD/ESRS disclosures [Source 1]"
12. "This answer has high confidence based on the synthesis of regulatory trends provided in the sources [Source 1, Source 2]"

### Key Improvements
1. **More inline citations** - Citations now appear immediately after claims
2. **Better claim detection** - 22 claims detected vs 12 before
3. **Structured response** - Clear sections with citations per point
4. **Note markers** - "[Note: The following is general guidance...]" used for uncited content

### Remaining Issues
1. **Verification rate still low (14%)** - The verifier is conservative
2. **Some citations grouped** - "[Source 1, Source 2]" at end of some paragraphs
3. **"Needs verification" warnings** - Sources still show this warning

## Conclusion
The system prompt improvement has increased the claim verification rate from 8% to 14% (+75% relative improvement). The response now contains more inline citations placed closer to their claims. Further improvements could include:
1. Making the verifier less strict (increase proximity threshold from 200 to 300 chars)
2. Adding more specific citation format examples in the prompt
3. Implementing a post-processing step to add missing citations
