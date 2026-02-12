---
DOC_TYPE: ATAM_ARTIFACT
ARTIFACT_TYPE: ISO25010_MAPPING
STATUS: draft
CREATED: 2026-02-12
REFERENCE: ISO/IEC 25010:2011 Systems and software Quality Requirements and Evaluation (SQuaRE)
---

# ISA ISO/IEC 25010 Mapping

## Purpose

Map ISA's 12 architecture dimensions to ISO/IEC 25010 product quality characteristics to ensure completeness of quality requirements.

## ISO/IEC 25010 Product Quality Model

### 1. Functional Suitability
**Definition:** Degree to which a product provides functions that meet stated and implied needs.

**ISA Dimensions:**
- **D1: Domain correctness** → Functional completeness, correctness, appropriateness
- **D10: LLM/RAG quality** → Functional correctness (citation accuracy, groundedness)

**Coverage:** ✅ COMPLETE

---

### 2. Performance Efficiency
**Definition:** Performance relative to the amount of resources used under stated conditions.

**ISA Dimensions:**
- **D5: Performance & scalability** → Time behavior, resource utilization, capacity

**Subcharacteristics:**
- Time behavior: p95/p99 latency thresholds
- Resource utilization: Database query efficiency, memory usage
- Capacity: Concurrent user support, data volume limits

**Coverage:** ✅ COMPLETE

---

### 3. Compatibility
**Definition:** Degree to which a product can exchange information with other products and perform required functions while sharing environments and resources.

**ISA Dimensions:**
- **D6: Maintainability** → Module contracts, API stability
- **D12: Operational governance** → Schema compatibility, versioning discipline

**Subcharacteristics:**
- Co-existence: tRPC API contracts, database schema migrations
- Interoperability: GS1 standards ingestion, EFRAG data formats

**Coverage:** ✅ COMPLETE

---

### 4. Usability
**Definition:** Degree to which a product can be used by specified users to achieve specified goals with effectiveness, efficiency, and satisfaction.

**ISA Dimensions:**
- **D11: UX/IA coherence** → Learnability, operability, user error protection, UI aesthetics, accessibility

**Subcharacteristics:**
- Appropriateness recognizability: Clear navigation, capability discovery
- Learnability: Onboarding, documentation
- Operability: Responsive UI, keyboard navigation
- User error protection: Validation, confirmation dialogs
- UI aesthetics: shadcn/ui consistency
- Accessibility: WCAG compliance

**Coverage:** ✅ COMPLETE

---

### 5. Reliability
**Definition:** Degree to which a system performs specified functions under specified conditions for a specified period of time.

**ISA Dimensions:**
- **D4: Reliability** → Availability, fault tolerance, recoverability

**Subcharacteristics:**
- Maturity: Defect density, failure rate
- Availability: Uptime SLO, error budget
- Fault tolerance: Graceful degradation, retry logic
- Recoverability: Backup/restore, RTO/RPO

**Coverage:** ✅ COMPLETE

---

### 6. Security
**Definition:** Degree to which a product protects information and data so that persons or other products have the degree of data access appropriate to their types and levels of authorization.

**ISA Dimensions:**
- **D3: Security** → Confidentiality, integrity, non-repudiation, accountability, authenticity

**Subcharacteristics:**
- Confidentiality: Secrets management, data encryption
- Integrity: Checksums, provenance tracking
- Non-repudiation: Audit logs
- Accountability: User action tracking
- Authenticity: Manus OAuth, JWT validation

**Coverage:** ✅ COMPLETE

---

### 7. Maintainability
**Definition:** Degree of effectiveness and efficiency with which a product can be modified by the intended maintainers.

**ISA Dimensions:**
- **D6: Maintainability** → Modularity, reusability, analyzability, modifiability, testability
- **D7: Testability & determinism** → Testability

**Subcharacteristics:**
- Modularity: tRPC routers, service separation
- Reusability: Shared utilities, component library
- Analyzability: Code structure, documentation
- Modifiability: Coupling, cohesion
- Testability: Test coverage, deterministic tests

**Coverage:** ✅ COMPLETE

---

### 8. Portability
**Definition:** Degree of effectiveness and efficiency with which a system can be transferred from one hardware, software, or other operational or usage environment to another.

**ISA Dimensions:**
- **D12: Operational governance** → Deployability, environment parity
- **D4: Reliability** → Disaster recovery, backup portability (where applicable)

**Subcharacteristics:**
- Adaptability: Environment configuration, feature flags
- Installability: Deployment automation, dependency management
- Replaceability: Database migration, vendor independence

**Coverage:** ⚠️ PARTIAL
- **Gap:** No explicit portability requirements for multi-cloud or database portability
- **Rationale:** ISA is tightly coupled to Manus hosting + TiDB; portability is out of scope for MVP
- **Status:** ACCEPTED LIMITATION

---

## Coverage Summary

| ISO/IEC 25010 Characteristic | ISA Dimensions | Coverage | Notes |
|------------------------------|----------------|----------|-------|
| Functional Suitability | D1, D10 | ✅ COMPLETE | Domain correctness + RAG quality |
| Performance Efficiency | D5 | ✅ COMPLETE | Latency, throughput, resource usage |
| Compatibility | D6, D12 | ✅ COMPLETE | API contracts, schema versioning |
| Usability | D11 | ✅ COMPLETE | UX/IA coherence |
| Reliability | D4 | ✅ COMPLETE | Availability, fault tolerance, recovery |
| Security | D3 | ✅ COMPLETE | AuthN/AuthZ, secrets, audit |
| Maintainability | D6, D7 | ✅ COMPLETE | Modularity, testability |
| Portability | D12, D4 | ⚠️ PARTIAL | Limited by Manus/TiDB coupling |

**Overall Coverage:** 7/8 complete, 1/8 partial (accepted limitation)

## Reverse Mapping (ISA → ISO/IEC 25010)

| ISA Dimension | ISO/IEC 25010 Characteristics |
|---------------|-------------------------------|
| D1: Domain correctness | Functional Suitability |
| D2: Evidence & provenance integrity | Security (Integrity), Maintainability (Analyzability) |
| D3: Security | Security |
| D4: Reliability | Reliability, Portability (partial) |
| D5: Performance & scalability | Performance Efficiency |
| D6: Maintainability | Maintainability, Compatibility |
| D7: Testability & determinism | Maintainability (Testability) |
| D8: Observability | Maintainability (Analyzability), Reliability (Maturity) |
| D9: Data model fitness | Functional Suitability, Maintainability (Modifiability) |
| D10: LLM/RAG quality | Functional Suitability |
| D11: UX/IA coherence | Usability |
| D12: Operational governance | Compatibility, Portability, Security (Accountability) |

## Gaps & Recommendations

### Identified Gaps
1. **Portability:** Limited multi-cloud/database portability
   - **Recommendation:** Document vendor lock-in risks in ATAM_RISKS
   - **Action:** Add portability constraints to D12 scorecard

2. **D2 (Evidence & provenance):** No direct ISO/IEC 25010 mapping
   - **Rationale:** D2 is ISA-specific governance requirement
   - **Closest match:** Security (Integrity) + Maintainability (Analyzability)
   - **Action:** Document as ISA-specific quality attribute

3. **D8 (Observability):** Spans multiple ISO characteristics
   - **Rationale:** Observability is cross-cutting concern
   - **Mapping:** Maintainability (Analyzability) + Reliability (Maturity)
   - **Action:** Ensure observability scenarios in ATAM Utility Tree

4. **D9 (Data model fitness):** Spans multiple ISO characteristics
   - **Rationale:** Data model quality affects functionality and maintainability
   - **Mapping:** Functional Suitability + Maintainability (Modifiability)
   - **Action:** Define data model quality metrics in D9 scorecard

## Validation Checklist

- [x] All ISO/IEC 25010 characteristics addressed
- [x] All ISA dimensions mapped to ≥1 ISO characteristic
- [x] Gaps documented with rationale
- [ ] Stakeholder review of accepted limitations
- [ ] ATAM scenarios cover all mapped characteristics

---

**Status:** DRAFT - Requires stakeholder validation  
**Owner:** Architecture Panel  
**Next Review:** TBD
