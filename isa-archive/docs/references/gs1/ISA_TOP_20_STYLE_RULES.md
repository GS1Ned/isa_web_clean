# ISA Top 20 GS1 Style Rules

**Source:** GS1 Style Guide Release 5.6, Approved, Jul 2025  
**Purpose:** Highest-impact rules for ISA advisory outputs to ensure GS1-grade quality  
**Scope:** Human-readable outputs only (Markdown/PDF/HTML documentation)

---

## 1. British English Spelling (Section 2.1)

**Rule:** Use British English per the Collins online dictionary for all ISA documentation.

**Examples:**
- ✅ analyse, artefact, centre, defence, organisation, standardise
- ❌ analyze, artifact, center, defense, organization, standardize

**Exception:** Machine-readable artefacts (JSON, schemas, APIs) use US English per Merriam-Webster.

**Impact:** HIGH - Consistency with GS1 global documentation standards.

---

## 2. Do NOT Capitalise "standard" (Section 2.3.1)

**Rule:** Do NOT capitalise the word "standard" when used with GS1, unless referencing a specific document title.

**Examples:**
- ✅ GS1 is a standards organisation
- ✅ GS1 develops global standards
- ✅ GS1 standards help companies improve supply chain efficiency
- ❌ GS1 Standards help companies improve supply chain efficiency
- ✅ See the *GS1 Digital Link Standard* (specific document title)

**Impact:** CRITICAL - Most common capitalisation error in GS1 documentation.

---

## 3. Sentence Case for Headings (Section 2.3)

**Rule:** Use sentence case for all headings – only the first word is capitalised.

**Examples:**
- ✅ GS1 helps companies drive efficiency and safety
- ❌ GS1 Helps Companies Drive Efficiency and Safety
- ✅ Our business benefits in retail
- ❌ Our Business Benefits in Retail

**Impact:** HIGH - Improves readability and approachable tone.

---

## 4. Spell Out Abbreviations on First Use (Section 2.3.2)

**Rule:** When an abbreviation is first used, spell out the term using initial capital letters.

**Examples:**
- ✅ The Global Data Synchronisation Network (GDSN) allows companies to share data
- ❌ GDSN allows companies to share data
- ✅ The European Sustainability Reporting Standards (ESRS) require disclosure
- ❌ ESRS require disclosure

**Exception:** "ID" is conventional for "identification" and does not need spelling out.

**Impact:** HIGH - Critical for accessibility to non-GS1 audiences.

---

## 5. Registered Trademark Symbol ® (Section 2.2)

**Rule:** Use ® the first time any GS1 registered trademark appears, and only once. If first occurrence is a heading, use in next occurrence.

**Examples:**
- ✅ GS1 DataBar® is the preferred barcode symbol (first occurrence)
- ✅ The DataBar symbol... (subsequent occurrences)

**Exception:** Do NOT use ® on "GS1" itself (already in logo and disclaimer).

**GS1 Registered Trademarks:** DataBar®, EAN®, EANCOM®, EPCglobal®, GDSN®, GS1®

**Impact:** MEDIUM - Legal compliance and brand consistency.

---

## 6. Date Format: DD MM YYYY (Section 2.5.2)

**Rule:** Use DD MM YYYY format with no punctuation between day, month, or year.

**Examples:**
- ✅ 1 December 2024 (full format)
- ✅ 1 Dec 2024 (abbreviated)
- ❌ December 1, 2014
- ❌ 01 Dec 2024
- ❌ 1-12-24, 12-1-24, Dec-1-24

**Impact:** MEDIUM - Consistency with GS1 global date conventions.

---

## 7. Document Titles in Italics (Section 2.4)

**Rule:** Unlinked document titles should be italicised. Do NOT italicise "section", "chapter", "appendix", "table", or "figure".

**Examples:**
- ✅ See the *Microsoft Style Guide*
- ✅ See the Microsoft Style Guide (hyperlinked - no italics needed)
- ❌ See the *Microsoft Style Guide* (hyperlinked)

**Note:** Avoid including publication dates or issue numbers unless critical.

**Impact:** MEDIUM - Professional presentation of references.

---

## 8. Use "e.g." Correctly (Section 2.6.6)

**Rule:** Use "e.g." (not "e.g") with comma after second full stop. Means "for example" or "such as".

**Examples:**
- ✅ Products modified for seasonal reasons (e.g., holiday packs) should carry a unique GTIN-12.
- ❌ Products modified for seasonal reasons (e.g. holiday packs)...
- ❌ Products modified for seasonal reasons (eg, holiday packs)...

**Impact:** MEDIUM - Correct Latin abbreviation usage.

---

## 9. No Comma Before "and" in Series (Section 2.6.8)

**Rule:** Do NOT use comma before "and" or "or" in a series (no Oxford comma), unless needed for clarity.

**Examples:**
- ✅ The new standard enables efficiency, sustainability and safety.
- ❌ The new standard enables efficiency, sustainability, and safety.
- ✅ Karen went to the meeting with her sisters, Paul, and John (Oxford comma for clarity)

**Impact:** MEDIUM - GS1 house style preference.

---

## 10. "that" vs. "which" (Section 2.6.5)

**Rule:**
- Use "that" for dependent clauses (cannot be removed without changing meaning)
- Use "which" for independent clauses (can be removed; almost always preceded by comma)

**Examples:**
- ✅ The ID number, which is located on the label, should be clearly legible.
- ✅ The digit that is in position thirteen is the check digit.

**Impact:** MEDIUM - Grammatical precision.

---

## 11. "may" vs. "can" (Section 2.6.4)

**Rule:**
- "can" means "to be able"
- "may" means "to have permission"

**Examples:**
- ✅ Users can download the report (ability)
- ✅ Users may submit feedback (permission)

**Impact:** MEDIUM - Normative language precision (critical for standards).

---

## 12. Hyphens in Compound Words (Section 2.6.1)

**Rule:** Hyphenate compound words that are hyphenated in www.gs1.org/glossary or dictionary. Hyphenate when used as adjectives before nouns.

**Examples:**
- ✅ end-user manuals, point-of-sale, ship-to address
- ✅ Decision making is one of his responsibilities. (noun)
- ✅ His decision-making skills were superb. (adjective before noun)

**Impact:** MEDIUM - Readability and GS1 terminology consistency.

---

## 13. Single Space After Full Stop (Section 2.6.3)

**Rule:** After a full stop or colon, place a single space. Do NOT use double-space.

**Impact:** LOW - Modern typography standard.

---

## 14. Figure and Table Numbering (Section 2.7)

**Rule:**
- **Figures:** Number and title below image, centred. Format: [Section]-[Sequential number]
- **Tables:** Number and title above table, flush left. Format: [Section]-[Sequential number]
- Avoid titles if figure/table is well-explained in text

**Examples:**
- Figure 2-1: Thumbnail of the GS1 Logo
- Table 2-1: An example of a GS1 table heading

**Impact:** MEDIUM - Professional document structure.

---

## 15. Accessibility: Alt Text for Images (Section 2.8.2.1)

**Rule:** Images must have text descriptions ("alt text") for readers with visual disability. Flowcharts need full descriptions if normative.

**Impact:** HIGH - Legal compliance (EAA European Accessibility Act) and inclusivity.

---

## 16. Accessibility: Do NOT Use Only Colour (Section 2.8.2.2)

**Rule:** Do NOT use colour as the exclusive way to convey meaning. Use patterned shading, dots, dashes, or different line styles.

**Examples:**
- ✅ Line chart with solid/dashed/dotted lines to distinguish series
- ❌ Line chart with only colour differences (orange/green/blue)

**Impact:** HIGH - Accessibility and black/white printing compatibility.

---

## 17. Bulleted Lists Format (Section 2.9)

**Rules:**
- Minimum two bullets
- Lead-in sentence ending with colon
- Capitalise first word of each item

**Example:**
Follow these rules when writing bulleted lists:
- A bulleted list should contain at least two bullets.
- Introduce the list with at least one lead-in sentence ending with a colon.

**Impact:** MEDIUM - Consistent list formatting.

---

## 18. Terminology: Use GS1 Glossary (Section 2.2)

**Rule:** Use www.gs1.org/glossary to define and research terminology. Follow GS1-specific term conventions.

**Key terms:**
- barcode (one word)
- database (one word)
- email (one word, no hyphen)
- online (one word, no hyphen)
- webpage (one word)
- website (one word)
- business-to-business (B2B)
- point-of-sale (POS)

**Impact:** HIGH - Terminology consistency with GS1 ecosystem.

---

## 19. No Abbreviation of "and" or "plus" (Section 2.5.1)

**Rule:** Do NOT abbreviate "and" as "&" or "plus" as "+" unless in figure/table with limited space.

**Examples:**
- ✅ efficiency and safety
- ❌ efficiency & safety (in running text)
- ✅ efficiency & safety (in table cell with space constraints)

**Impact:** LOW - Professional tone in running text.

---

## 20. Prefixes Without Hyphens (Section 2.6.2)

**Rule:** Prefixes and suffixes usually combine without hyphen or space (e.g., dehumidify, lifelike), unless meaning could be misconstrued.

**Examples:**
- ✅ Untie the knot.
- ✅ He recovered in time. (regained health)
- ✅ He re-covered the label. (covered again - hyphen prevents confusion)

**Impact:** LOW - Correct prefix usage.

---

## Summary of Impact Levels

**CRITICAL (1 rule):**
- Rule 2: Do NOT capitalise "standard"

**HIGH (5 rules):**
- Rule 1: British English spelling
- Rule 3: Sentence case for headings
- Rule 4: Spell out abbreviations
- Rule 15: Alt text for images
- Rule 16: Do NOT use only colour
- Rule 18: Use GS1 glossary

**MEDIUM (11 rules):**
- Rules 5-7, 8-12, 14, 17

**LOW (3 rules):**
- Rules 13, 19, 20

---

## Application to ISA Outputs

**Apply these rules to:**
- ISA advisory reports (Markdown/PDF/HTML)
- Gap analysis documents
- Recommendation reports
- Dataset documentation
- Governance documents

**Do NOT apply to:**
- JSON schemas (use US English, camelCase, etc.)
- API endpoints (use US English, snake_case, etc.)
- Database field names (use US English, snake_case)
- Code variable names (follow language conventions)
