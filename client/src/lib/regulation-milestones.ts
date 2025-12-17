/**
 * Regulation Milestone Data
 * 
 * Provides comprehensive milestone timelines for key EU regulations.
 * Based on official EU documentation and implementation schedules.
 */

export interface TimelineMilestone {
  date: string;
  event: string;
  description: string;
  status: "completed" | "upcoming" | "future";
}

/**
 * Get milestones for a specific regulation by CELEX ID or title
 */
export function getRegulationMilestones(regulationCode: string, effectiveDate?: string): TimelineMilestone[] {
  const now = new Date();
  
  // Helper to determine status
  const getStatus = (dateStr: string): "completed" | "upcoming" | "future" => {
    const date = new Date(dateStr);
    const diffDays = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffDays < 0) return "completed";
    if (diffDays < 180) return "upcoming"; // Within 6 months
    return "future";
  };

  // CSRD Milestones
  if (regulationCode.includes("CSRD") || regulationCode.includes("32022L0464") || regulationCode.includes("32022-02464")) {
    return [
      {
        date: "2024-01-01T00:00:00Z",
        event: "CSRD Enters into Force",
        description: "Corporate Sustainability Reporting Directive becomes EU law",
        status: getStatus("2024-01-01T00:00:00Z")
      },
      {
        date: "2024-01-01T00:00:00Z",
        event: "ESRS Standards Published",
        description: "European Sustainability Reporting Standards (ESRS) officially adopted",
        status: getStatus("2024-01-01T00:00:00Z")
      },
      {
        date: "2025-01-01T00:00:00Z",
        event: "Large Listed Companies (Phase 1)",
        description: "Companies with >500 employees must report on FY2024 (reporting in 2025)",
        status: getStatus("2025-01-01T00:00:00Z")
      },
      {
        date: "2026-01-01T00:00:00Z",
        event: "Large Companies (Phase 2)",
        description: "Companies with >250 employees must report on FY2025 (reporting in 2026)",
        status: getStatus("2026-01-01T00:00:00Z")
      },
      {
        date: "2027-01-01T00:00:00Z",
        event: "Listed SMEs (Phase 3)",
        description: "Listed SMEs must report on FY2026 (reporting in 2027)",
        status: getStatus("2027-01-01T00:00:00Z")
      },
      {
        date: "2029-01-01T00:00:00Z",
        event: "Non-EU Companies (Phase 4)",
        description: "Large non-EU companies with EU operations must report on FY2028",
        status: getStatus("2029-01-01T00:00:00Z")
      }
    ];
  }

  // EUDR Milestones
  if (regulationCode.includes("EUDR") || regulationCode.includes("Deforestation") || regulationCode.includes("32023-1115")) {
    return [
      {
        date: "2023-06-29T00:00:00Z",
        event: "EUDR Adopted",
        description: "EU Deforestation Regulation officially adopted by EU Parliament",
        status: getStatus("2023-06-29T00:00:00Z")
      },
      {
        date: "2024-12-30T00:00:00Z",
        event: "Due Diligence System Deadline",
        description: "Large operators must establish due diligence systems",
        status: getStatus("2024-12-30T00:00:00Z")
      },
      {
        date: "2025-06-30T00:00:00Z",
        event: "SME Compliance Deadline",
        description: "Small and medium enterprises must comply with EUDR requirements",
        status: getStatus("2025-06-30T00:00:00Z")
      },
      {
        date: "2026-12-30T00:00:00Z",
        event: "Full Enforcement",
        description: "All operators must demonstrate deforestation-free supply chains with geolocation data",
        status: getStatus("2026-12-30T00:00:00Z")
      }
    ];
  }

  // DPP (Digital Product Passport) Milestones
  if (regulationCode.includes("DPP") || regulationCode.includes("Product Passport") || regulationCode.includes("32023L2772") || regulationCode.includes("32024-1689") || regulationCode.includes("32023-2763")) {
    // Check if it's battery-specific
    if (regulationCode.includes("Batter")) {
      return [
        {
          date: "2024-02-18T00:00:00Z",
          event: "Battery Regulation Enters into Force",
          description: "New EU Battery Regulation with DPP requirements becomes law",
          status: getStatus("2024-02-18T00:00:00Z")
        },
        {
          date: "2025-02-18T00:00:00Z",
          event: "Battery Passport Phase 1",
          description: "Industrial and EV batteries must have digital product passports",
          status: getStatus("2025-02-18T00:00:00Z")
        },
        {
          date: "2027-02-18T00:00:00Z",
          event: "Battery Passport Phase 2",
          description: "All rechargeable batteries >2kWh must have digital passports",
          status: getStatus("2027-02-18T00:00:00Z")
        }
      ];
    }
    
    // Check if it's textile-specific
    if (regulationCode.includes("Textile")) {
      return [
        {
          date: "2025-01-01T00:00:00Z",
          event: "Textile DPP Regulation Published",
          description: "Digital Product Passport requirements for textiles announced",
          status: getStatus("2025-01-01T00:00:00Z")
        },
        {
          date: "2026-07-01T00:00:00Z",
          event: "Textile DPP Phase 1",
          description: "Large textile manufacturers must implement digital product passports",
          status: getStatus("2026-07-01T00:00:00Z")
        },
        {
          date: "2028-01-01T00:00:00Z",
          event: "Textile DPP Full Compliance",
          description: "All textile products in EU market must have digital passports",
          status: getStatus("2028-01-01T00:00:00Z")
        }
      ];
    }

    // Generic DPP milestones
    return [
      {
        date: "2024-07-18T00:00:00Z",
        event: "ESPR Enters into Force",
        description: "Ecodesign for Sustainable Products Regulation establishes DPP framework",
        status: getStatus("2024-07-18T00:00:00Z")
      },
      {
        date: "2026-01-01T00:00:00Z",
        event: "First Product Categories",
        description: "Initial product categories (batteries, electronics) must have DPPs",
        status: getStatus("2026-01-01T00:00:00Z")
      },
      {
        date: "2027-07-01T00:00:00Z",
        event: "Extended Product Coverage",
        description: "DPP requirements extended to textiles, furniture, construction products",
        status: getStatus("2027-07-01T00:00:00Z")
      },
      {
        date: "2030-01-01T00:00:00Z",
        event: "Universal DPP Coverage",
        description: "All physical products in scope must have digital product passports",
        status: getStatus("2030-01-01T00:00:00Z")
      }
    ];
  }

  // PPWR (Packaging) Milestones
  if (regulationCode.includes("PPWR") || regulationCode.includes("Packaging") || regulationCode.includes("32025-0040")) {
    return [
      {
        date: "2024-01-01T00:00:00Z",
        event: "PPWR Adopted",
        description: "Packaging and Packaging Waste Regulation officially adopted",
        status: getStatus("2024-01-01T00:00:00Z")
      },
      {
        date: "2025-01-01T00:00:00Z",
        event: "Recycled Content Requirements",
        description: "Minimum recycled content requirements for plastic packaging begin",
        status: getStatus("2025-01-01T00:00:00Z")
      },
      {
        date: "2026-01-01T00:00:00Z",
        event: "Reusability Targets Phase 1",
        description: "First wave of reusability and refill targets for packaging",
        status: getStatus("2026-01-01T00:00:00Z")
      },
      {
        date: "2030-01-01T00:00:00Z",
        event: "Full Circular Economy Targets",
        description: "All packaging must be recyclable and meet circular economy criteria",
        status: getStatus("2030-01-01T00:00:00Z")
      }
    ];
  }

  // Default: use effective date if provided
  if (effectiveDate) {
    return [
      {
        date: effectiveDate,
        event: "Regulation Effective Date",
        description: "Regulation becomes effective",
        status: getStatus(effectiveDate)
      }
    ];
  }

  return [];
}
