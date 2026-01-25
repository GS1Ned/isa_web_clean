/**
 * Attribute Recommender Router
 * 
 * Provides AI-powered GS1 attribute recommendations based on:
 * - Sector-specific requirements
 * - Target regulations (CSRD, DPP, ESPR, etc.)
 * - Current attribute coverage
 * - Company size considerations
 * 
 * Includes confidence scoring and epistemic markers for transparency.
 */

import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import {
  generateAttributeRecommendations,
  type AttributeRecommendationInput,
  type AttributeRecommendationResult,
} from '../attribute-recommender.js';

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

const recommendationInputSchema = z.object({
  sector: z.string(),
  productCategory: z.string().optional(),
  targetRegulations: z.array(z.string()).optional(),
  currentAttributes: z.array(z.string()).optional(),
  companySize: z.enum(['small', 'medium', 'large']).optional(),
});

// =============================================================================
// ROUTER
// =============================================================================

export const attributeRecommenderRouter = router({
  /**
   * Get available sectors for recommendation
   */
  getAvailableSectors: publicProcedure.query(async () => {
    return [
      { id: 'food_beverage', name: 'Food & Beverage', description: 'Food products, beverages, and related packaging' },
      { id: 'retail', name: 'Retail', description: 'General retail and consumer goods' },
      { id: 'manufacturing', name: 'Manufacturing', description: 'Industrial and manufacturing products' },
      { id: 'electronics', name: 'Electronics', description: 'Electronic devices and components' },
      { id: 'textiles', name: 'Textiles & Apparel', description: 'Clothing, textiles, and fashion' },
      { id: 'healthcare', name: 'Healthcare', description: 'Medical devices and healthcare products' },
      { id: 'agriculture', name: 'Agriculture', description: 'Agricultural products and farming' },
      { id: 'construction', name: 'Construction', description: 'Building materials and construction' },
      { id: 'automotive', name: 'Automotive', description: 'Vehicles and automotive parts' },
      { id: 'chemicals', name: 'Chemicals', description: 'Chemical products and substances' },
    ];
  }),

  /**
   * Get available regulations for targeting
   */
  getAvailableRegulations: publicProcedure.query(async () => {
    return [
      { id: 'CSRD', name: 'Corporate Sustainability Reporting Directive', shortName: 'CSRD' },
      { id: 'DPP', name: 'Digital Product Passport', shortName: 'DPP' },
      { id: 'ESPR', name: 'Ecodesign for Sustainable Products Regulation', shortName: 'ESPR' },
      { id: 'EUDR', name: 'EU Deforestation Regulation', shortName: 'EUDR' },
      { id: 'PPWR', name: 'Packaging and Packaging Waste Regulation', shortName: 'PPWR' },
      { id: 'CS3D', name: 'Corporate Sustainability Due Diligence Directive', shortName: 'CS3D' },
      { id: 'BATTERY_REG', name: 'EU Battery Regulation', shortName: 'Battery Reg' },
      { id: 'REACH', name: 'Registration, Evaluation, Authorisation and Restriction of Chemicals', shortName: 'REACH' },
      { id: 'FIC', name: 'Food Information to Consumers', shortName: 'FIC' },
      { id: 'WEEE', name: 'Waste Electrical and Electronic Equipment', shortName: 'WEEE' },
    ];
  }),

  /**
   * Get company size options
   */
  getCompanySizeOptions: publicProcedure.query(async () => {
    return [
      { id: 'small', name: 'Small Enterprise', description: 'Less than 50 employees' },
      { id: 'medium', name: 'Medium Enterprise', description: '50-250 employees' },
      { id: 'large', name: 'Large Enterprise', description: 'More than 250 employees' },
    ];
  }),

  /**
   * Get sample GS1 attributes for current coverage selection
   */
  getSampleAttributes: publicProcedure.query(async () => {
    return [
      { id: 'gtin', name: 'GTIN (Global Trade Item Number)', category: 'Identification' },
      { id: 'gln', name: 'GLN (Global Location Number)', category: 'Identification' },
      { id: 'productDescription', name: 'Product Description', category: 'Basic' },
      { id: 'brandName', name: 'Brand Name', category: 'Basic' },
      { id: 'countryOfOrigin', name: 'Country of Origin', category: 'Origin' },
      { id: 'netContent', name: 'Net Content', category: 'Measurement' },
      { id: 'packagingMaterial', name: 'Packaging Material', category: 'Sustainability' },
      { id: 'recycledContentPercentage', name: 'Recycled Content Percentage', category: 'Sustainability' },
      { id: 'productCarbonFootprint', name: 'Product Carbon Footprint', category: 'Sustainability' },
      { id: 'energyEfficiencyClass', name: 'Energy Efficiency Class', category: 'Sustainability' },
      { id: 'hazardousSubstances', name: 'Hazardous Substances', category: 'Safety' },
      { id: 'allergenInformation', name: 'Allergen Information', category: 'Food Safety' },
      { id: 'nutritionalInformation', name: 'Nutritional Information', category: 'Food Safety' },
      { id: 'supplierInformation', name: 'Supplier Information', category: 'Supply Chain' },
      { id: 'batchNumber', name: 'Batch/Lot Number', category: 'Traceability' },
      { id: 'serialNumber', name: 'Serial Number', category: 'Traceability' },
      { id: 'expirationDate', name: 'Expiration Date', category: 'Lifecycle' },
      { id: 'warrantyInformation', name: 'Warranty Information', category: 'Lifecycle' },
    ];
  }),

  /**
   * Generate attribute recommendations based on input parameters
   */
  recommend: publicProcedure
    .input(recommendationInputSchema)
    .mutation(async ({ input }): Promise<AttributeRecommendationResult> => {
      // Map sector ID to display name for the recommendation engine
      const sectorMap: Record<string, string> = {
        'food_beverage': 'Food & Beverage',
        'retail': 'Retail',
        'manufacturing': 'Manufacturing',
        'electronics': 'Electronics',
        'textiles': 'Textiles & Apparel',
        'healthcare': 'Healthcare',
        'agriculture': 'Agriculture',
        'construction': 'Construction',
        'automotive': 'Automotive',
        'chemicals': 'Chemicals',
      };

      const recommendationInput: AttributeRecommendationInput = {
        sector: sectorMap[input.sector] || input.sector,
        productCategory: input.productCategory,
        targetRegulations: input.targetRegulations,
        currentAttributes: input.currentAttributes,
        companySize: input.companySize,
      };

      return await generateAttributeRecommendations(recommendationInput);
    }),

  /**
   * Get recommendation history for authenticated user
   */
  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      // For now, return empty array - can be extended to store history in DB
      return [];
    }),
});
