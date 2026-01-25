# GS1 Brand Research Notes

**Date:** 16 December 2025  
**Purpose:** Document GS1 brand assets and requirements for ISA Visual & Branding Development Plan

---

## GS1 Global Brand Manual

**Source:** GS1 Global Brand Manual (175 pages)  
**URL:** https://1846849.fs1.hubspotusercontent-na1.net/hubfs/1846849/Pagina_de_marca/Templates_Corporativos/GS1_GlobalBrandManual.pdf  
**Date:** 3 September 2021  
**Tagline:** "The Global Language of Business"  
**Subtitle:** "Delivering global coherence and local flexibility"

### Key Visual Elements Observed

1. **Primary Brand Color:**
   - GS1 Orange: Prominent brand color (used in header blocks, accents)
   - Appears to be approximately #FF6633 or similar warm orange

2. **Logo:**
   - Navy blue circular concentric rings with "GS1" text
   - Registered trademark symbol (®)
   - Clean, modern, geometric design
   - Strong recognition value

3. **Typography:**
   - Sans-serif typeface (appears to be a modern grotesque)
   - Clean, professional, highly legible

4. **Design Principles:**
   - "Global coherence and local flexibility" suggests:
     * Core brand elements must be consistent
     * Local GS1 MOs have some adaptation freedom
     * Balance between standardization and customization

---

## Additional GS1 Brand Resources Identified

### 1. GS1 GDSN Branding Guidelines
**URL:** https://www.gs1.org/docs/gdsn/marketing/GS1_GDSN_Branding_Guidelines.pdf  
**Relevance:** Guidelines for GS1-certified data pools and Member Organizations  
**Status:** Accessible, should be reviewed for compliance requirements

### 2. GS1 Style Guide (Release 5.6)
**URL:** https://www.gs1.org/standards/gs1-style-guide/current-standard  
**Relevance:** Grammatical style, naming conventions, figure/table use  
**Status:** Already integrated into ISA (97-98% compliance achieved)  
**Note:** Covers editorial standards, not visual branding

### 3. GS1 Certificate Program Logo Guidelines
**URL:** https://documents.gs1us.org/adobe/assets/deliver/urn:aaid:aem:715b5c31-b776-4df3-9b85-63f282ca42f9/Guidelines-for-Using-GS1-US-Certificate-Logos.pdf  
**Relevance:** Logo usage rules for partners  
**Status:** Accessible, relevant for ISA's relationship to GS1

### 4. GS1 Brand Assets (Third-Party Source)
**URL:** https://brandfetch.com/gs1.org  
**Colors Identified:**
- **Midnight Blue:** #002C6C (RGB: 0, 44, 108)
- **Orange:** (Hex not specified, but visually prominent)

**Status:** Third-party aggregation, should verify against official sources

---

## Current ISA Visual State Analysis

### Color Palette (from `/client/src/index.css`)

**ISA Theme:** "ISA Regulatory Tech Theme - Deep Blue and Teal"

**Current Colors:**
- **Primary:** Blue 700 (deep blue)
- **Secondary:** OKLCH teal/cyan (0.65 0.18 200)
- **Accent:** OKLCH blue (0.55 0.18 240)
- **Charts:** Blue-to-teal gradient (240° to 140° hue range)

**Analysis:**
- ✅ Professional, technical, regulatory-appropriate
- ✅ Blue aligns with GS1's navy blue brand color
- ⚠️ **No GS1 orange present** - potential brand alignment gap
- ⚠️ Teal/cyan is not a GS1 brand color
- ⚠️ No explicit GS1 visual reference or co-branding

### Typography
**Current:** Not explicitly defined in index.css (likely using Tailwind defaults)
**GS1 Requirement:** Unknown (requires full brand manual review)

### Logo/Branding
**Current:** ISA uses custom logo (blue circular icon)
**GS1 Requirement:** Unknown - need to determine if ISA should:
- Display GS1 logo alongside ISA logo
- Include "Powered by GS1" or similar attribution
- Follow GS1 co-branding guidelines

---

## Critical Questions (Require GS1 Brand Manual Review)

1. **Color Palette:**
   - What are the official GS1 brand colors (hex/RGB values)?
   - Is GS1 orange mandatory for GS1-affiliated tools?
   - Can ISA use blue as primary while incorporating orange as accent?

2. **Logo Usage:**
   - Must ISA display the GS1 logo?
   - If yes, what are the size, placement, and clearance requirements?
   - Are there co-branding templates for GS1 MO projects?

3. **Typography:**
   - What is GS1's official typeface?
   - Are there approved web-safe alternatives?
   - What are the hierarchy and sizing rules?

4. **Visual Style:**
   - What graphic styles are permitted (gradients, shadows, borders)?
   - Are there approved icon styles or libraries?
   - What are the photography/illustration guidelines?

5. **Member Organization Flexibility:**
   - How much visual customization is allowed for GS1 NL projects?
   - Can ISA maintain its own visual identity while being GS1-compliant?
   - Are there examples of compliant GS1 MO digital tools?

6. **Trademark & Naming:**
   - Is "ISA - Intelligent Standards Architect" compliant with GS1 naming rules?
   - Are there restrictions on using "GS1" in product names or descriptions?
   - What disclaimers or attributions are required?

---

## Next Steps

1. **Download and review full GS1 Global Brand Manual** (175 pages)
   - Extract official color palette (hex/RGB values)
   - Document logo usage rules
   - Identify typography requirements
   - Note graphic style guidelines

2. **Review GS1 GDSN Branding Guidelines**
   - Understand requirements for GS1-certified tools
   - Identify co-branding templates

3. **Consult GS1 Netherlands (if possible)**
   - Confirm local MO visual flexibility
   - Request any GS1 NL-specific brand assets
   - Clarify ISA's official relationship to GS1

4. **Audit ISA's current visual implementation**
   - Identify GS1 compliance gaps
   - Propose minimal changes for compliance
   - Design enhanced branding that respects both ISA identity and GS1 requirements

---

**Status:** Research in progress - need to extract detailed specifications from GS1 Global Brand Manual


---

## GS1 Global Brand Manual - Additional Details

**Version:** 2.0  
**Date:** 07 September 2021  
**Online Resources:** mozone.gs1.org/brand

### Brand Manual Scope

"This manual is a guide to the building blocks of the GS1 global brand (logos, colours, typography and graphic styles) as well as to the assets and templates available online that enable all GS1 MOs to create materials within the GS1 global brand system."

### Key Statement

"The global brand initiative is a major strategic commitment undertaken by all GS1 Member Organisations (GS1 MOs) to create a unified and coherent global GS1 brand.

At the heart of this commitment is the creation of tools, resources and guidance to enable GS1 MOs to speak with one voice to the constituencies of GS1 worldwide."

### Implications for ISA

1. **Unified Brand Requirement:** All GS1 MOs (including GS1 NL) are committed to a "unified and coherent global GS1 brand"
2. **One Voice:** ISA should align with GS1's global voice and visual identity
3. **MO Zone Access:** Brand assets and templates available at mozone.gs1.org/brand (may require GS1 MO credentials)
4. **Regular Updates:** Brand manual updated periodically (Version 2.0 from Sept 2021, check for newer versions)

### Action Items

- [ ] Verify if GS1 Brand Manual Version 3.0 or later exists (current version is 2.0 from 2021)
- [ ] Determine if ISA team has access to mozone.gs1.org/brand
- [ ] Request GS1 NL to provide official brand assets and templates
- [ ] Clarify ISA's official status: Is it a GS1 NL project, GS1-affiliated tool, or independent tool using GS1 data?


---

## GS1 Official Color Palette (VERIFIED)

**Source:** GS1 Global Color Palette CMYK 2014-12-172.pdf  
**URL:** https://www.gs1es.org/wp-content/uploads/2015/12/GS1_Global_Color_Palette_CMYK_2014-12-172.pdf

### Primary Brand Colours

**Use these colours as the dominant colours for any general, cross-industry materials.**

| Color Name | PMS | CMYK | RGB | HEX |
|------------|-----|------|-----|-----|
| **GS1 Blue** | 655 C | C100 M80 Y0 K42 | R0 G41 B108 | **#00296C** |
| **GS1 Orange** | 1665 C | C0 M75 Y100 K0 | R242 G101 B52 | **#F26534** |
| **GS1 Dark Gray** | Cool Gray 11 C | C2 R0 Y0 K80 | R0 G60 B89 | **#4C4C4C** |
| **GS1 Dark Medium Gray** | Cool Gray 8 C | C0 M0 Y0 K50 | R151 G153 B151 | **#888B8D** |
| **GS1 Light Medium Gray** | Cool Gray 5 C | C0 M0 Y0 K30 | R177 G179 B179 | **#B1B3B3** |
| **GS1 Light Gray** | Cool Gray 1 C | C0 M0 Y0 K10 | R244 G244 B244 | **#F4F4F4** |

### Secondary Brand Colours

**Use the designated secondary colour for colour-coding industry-specific content and Identify, Capture, Share, Use content. Multiple secondary colours may be used together for infographics or as accents in general (cross-industry) materials.**

#### Retail, Capture
- **GS1 Raspberry:** PMS 213 C | RGB R230 G0 B126 | HEX #E6007E

#### General Merchandise
- **GS1 Purple:** PMS 252 C | RGB R151 G51 B145 | HEX #973391

#### Apparel
- **GS1 Lavender:** PMS 2073 C | RGB R175 G150 B222 | HEX #AF96DE

#### Automotive
- **GS1 Slate:** PMS 7453 C | RGB R127 G167 B219 | HEX #99A7DB

#### Healthcare, Identity
- **GS1 Sky:** PMS 638 C | RGB R0 G142 B222 | HEX #008EDE

#### HTML Links Only
- **GS1 Link:** Process Blue C | RGB R0 G151 B169 | HEX #0097A9

#### Business, Fuel
- **GS1 Teal:** PMS 550 C | RGB R141 G145 B202 | HEX #8D91CA

#### Transport, Logistics
- **GS1 Teal:** PMS 3262 C | RGB R45 G183 B195 | HEX #2DB7C3

#### Government
- **GS1 Mint:** PMS 2248 C | RGB R153 G243 B187 | HEX #99F3BB

#### Foodservice, Share
- **GS1 Grass:** PMS 2270 C | RGB R122 G193 B67 | HEX #7AC143

#### Recycling
- **GS1 Forest:** PMS 7481 C | RGB R0 G138 B79 | HEX #008A4F

#### Raw Materials
- **GS1 Olive:** PMS 2304 C | RGB R157 G167 B79 | HEX #9DA74F

#### Agriculture
- **GS1 Lime:** PMS 382 C | RGB R193 G214 B67 | HEX #C1D643

#### Finance
- **GS1 Gold:** PMS 612 C | RGB R196 G176 B0 | HEX #C4B000

#### Fresh Foods
- **GS1 Peach:** PMS 137 C | RGB R251 G176 B52 | HEX #FBB034

#### CRM, Use
- **GS1 Tangerine:** PMS 151 C | RGB R255 G150 B0 | HEX #FF9600

#### Construction
- **GS1 Honey:** PMS 7556 C | RGB R183 G139 B12 | HEX #B78B0C

#### Aerospace & Defence
- **GS1 Terracotta:** PMS 7591 C | RGB R211 G135 B95 | HEX #D3875F

### Color Usage Rules

1. **Primary colors** (Blue, Orange, Grays) are for general, cross-industry materials
2. **Secondary colors** are for industry-specific content and color-coding
3. Multiple secondary colors can be used together for infographics or accents
4. **GS1 Link** (Process Blue) is specifically for HTML hyperlinks only

### ISA Color Alignment Analysis

**Current ISA Colors:**
- Primary: Deep blue (similar to GS1 Blue)
- Secondary: Teal/cyan
- Accent: Blue

**GS1 Compliance Status:**
- ✅ Blue is aligned with GS1 Blue (#00296C)
- ❌ **Missing GS1 Orange** - the signature GS1 brand color
- ⚠️ Teal/cyan could be aligned with GS1 Teal (Transport/Logistics #2DB7C3) or GS1 Mint (Government #99F3BB)
- ⚠️ No use of GS1 secondary colors for industry-specific content

**Recommendations:**
1. **Add GS1 Orange (#F26534)** as a primary accent color
2. **Align blue** to exact GS1 Blue (#00296C)
3. **Map secondary colors** to appropriate GS1 industry colors:
   - Government/Regulatory → GS1 Mint (#99F3BB) or GS1 Teal (#2DB7C3)
   - Standards/Data → GS1 Sky (#008EDE) for Healthcare/Identity
4. **Use GS1 Link (#0097A9)** for all hyperlinks


---

## GS1 Web Design System (Third-Party Case Study)

**Source:** Chloe Atchue-Mamlet - GS1 Web Design System  
**URL:** https://www.chloeam.com/work/gs1-design-system  
**Date:** Recent (post-2014 component library)

### Project Context

**Challenge:** 115 national GS1 offices had inconsistent websites, costly maintenance, duplication of work  
**Goal:** "Balance brand consistency with enough flexibility for national offices to adapt it to meet their local needs"  
**Budget:** Small budget, prioritized based on MO survey feedback  
**Top Priority:** Extensive documentation (winner by far)

### Deliverables

**Design System:**
- 34 components (public-facing marketing sites + products/services)
- Text styles, color palette, spacing tokens
- SCSS package (brand styles, variables, utility classes)
- Component libraries (Sketch, Adobe XD, Figma)

**Guidance:**
- Extensive documentation for each component
- Resources for designers, developers, marketers
- 20 sample web pages showing component combinations
- Right-to-left language guidance
- FAQs

### Key Design Decisions

#### 1. Color Palette Challenge

**Problem:** GS1 brand colors are bright and fail WCAG AA contrast when paired with white  
**Constraint:** Brand colors could not be changed (high emotional attachment)  
**Solution:** 
- Original brand colors retained
- **Accessible alternate for each brand color** (darker shades)
- Two darker shades per hue for interactive states
- Separate "UI palette" of neutrals for text, backgrounds, rules

**Lesson for ISA:** GS1 acknowledges accessibility challenges with brand colors and provides accessible alternatives

#### 2. Typography

**Approach:** Responsive typography that scales programmatically based on viewport  
**Implementation:** CSS-based automatic scaling (not distinct mobile/tablet/desktop styles)  
**Benefit:** Automatic text scaling as viewport scales

#### 3. Component Strategy

**Scope:** 34 components covering:
- Marketing sites
- Products and services
- Various page types (home, landing, content)

**Flexibility:** Components designed to be combined in multiple ways for different results

### Visual Patterns Observed

**Layout:**
- Hero sections with large imagery and CTAs
- Multi-column content layouts
- Card-based component systems
- Prominent use of GS1 Orange for CTAs and accents
- Deep blue (GS1 Blue) for headers and primary elements

**Brand Elements:**
- Colorful grid patterns (using GS1's 20 brand colors)
- Clean, modern sans-serif typography
- White space and breathing room
- Professional photography
- Barcode imagery as brand signature

### Implications for ISA

1. **Federated Brand Model:** GS1 allows local flexibility within global consistency - ISA could follow similar approach
2. **Accessibility Priority:** GS1 created accessible color alternatives - ISA should do the same
3. **Documentation Focus:** Extensive documentation was top priority - ISA should document design decisions
4. **Component-Based:** Modern design system approach - ISA already uses shadcn/ui components
5. **Responsive First:** Programmatic scaling for all screen sizes - ISA should verify responsive behavior

### Questions for ISA Positioning

- Is ISA a "GS1 NL project" or "GS1-affiliated tool"?
- Should ISA use the GS1 Web Design System components?
- Or should ISA create its own visual identity while respecting GS1 brand guidelines?
- What level of GS1 branding is required (logo, colors, attribution)?
