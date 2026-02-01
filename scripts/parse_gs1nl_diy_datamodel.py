#!/usr/bin/env python3
"""
Parse GS1 Benelux DIY Datamodel Excel file and generate JSON content for ingestion.
"""

import pandas as pd
import json
from pathlib import Path

def parse_diy_datamodel(excel_path: str, output_path: str):
    """Parse the DIY datamodel Excel file."""
    
    # Read the Fielddefinitions sheet, skipping header rows
    # Row 0-1 are headers, row 2 contains column names, data starts at row 3
    df = pd.read_excel(excel_path, sheet_name='Fielddefinitions', engine='openpyxl', header=None, skiprows=3)
    
    # Based on the actual structure, map columns by position
    # Column 0: FieldID, 1: FieldID replaced by, 2: deprecation date
    # Column 3: Attributename Dutch, 4: Definition Dutch, 5: Instruction Dutch
    # Column 6: Remark(s) Dutch, 7: Format, 8: Min Len, 9: Max Len
    # Column 10: Decimals, 11: Example, 12: UoM fixed, 13: Picklist ID
    # Column 14: Repeat, 15: Mand GDSN, 16: Mand Funct, 17: Dependency
    # Column 18: Version, 19: GDSN name, 20: Attributename English
    # Column 21: Definition English, 22: Instruction English, 23: Remark(s) English
    # Column 24: Attribute Category, 25: XML Path
    
    column_names = [
        'field_id', 'field_id_replaced_by', 'deprecation_date',
        'attribute_name_nl', 'definition_nl', 'instruction_nl', 'remarks_nl',
        'format', 'min_length', 'max_length', 'decimals', 'example',
        'uom_fixed', 'picklist_id', 'repeat', 'mandatory_gdsn', 'mandatory_functional',
        'dependency', 'version', 'gdsn_name', 'attribute_name_en',
        'definition_en', 'instruction_en', 'remarks_en', 'attribute_category', 'xml_path'
    ]
    
    # Rename columns up to the available count
    df.columns = column_names[:len(df.columns)] + [f'col_{i}' for i in range(len(column_names), len(df.columns))]
    
    # Filter out rows without a valid attribute name
    df = df[df['attribute_name_nl'].notna()]
    df = df[df['attribute_name_nl'].apply(lambda x: isinstance(x, str) and len(x.strip()) > 0)]
    
    content_items = []
    
    for idx, row in df.iterrows():
        try:
            attr_name_nl = str(row.get('attribute_name_nl', '')).strip()
            if not attr_name_nl or attr_name_nl == 'nan':
                continue
                
            # Build content text
            content_parts = [
                f"GS1 Benelux DIY Datamodel - Attribuut: {attr_name_nl}",
                "",
                "**Identificatie**",
                f"- Lokale attribuutnaam (NL): {attr_name_nl}",
                f"- GDSN naam: {row.get('gdsn_name', 'N/A')}",
                f"- Veld ID: {row.get('field_id', 'N/A')}",
                "",
                "**Definitie**",
                f"{row.get('definition_nl', 'Geen definitie beschikbaar')}",
            ]
            
            if pd.notna(row.get('instruction_nl')):
                content_parts.extend([
                    "",
                    "**Invulinstructie**",
                    f"{row.get('instruction_nl')}"
                ])
            
            if pd.notna(row.get('remarks_nl')):
                content_parts.extend([
                    "",
                    "**Opmerkingen**",
                    f"{row.get('remarks_nl')}"
                ])
            
            content_parts.extend([
                "",
                "**Technische Specificaties**",
                f"- Formaat: {row.get('format', 'N/A')}",
                f"- Minimale lengte: {row.get('min_length', 'N/A')}",
                f"- Maximale lengte: {row.get('max_length', 'N/A')}",
                f"- Decimalen: {row.get('decimals', 'N/A')}",
            ])
            
            if pd.notna(row.get('example')):
                content_parts.extend([
                    "",
                    "**Voorbeeld**",
                    f"{row.get('example')}"
                ])
            
            content_parts.extend([
                "",
                "**Verplichtingen**",
                f"- Verplicht GDSN: {row.get('mandatory_gdsn', 'N/A')}",
                f"- Functioneel verplicht: {row.get('mandatory_functional', 'N/A')}",
            ])
            
            if pd.notna(row.get('attribute_name_en')):
                content_parts.extend([
                    "",
                    "**English**",
                    f"- Attribute name: {row.get('attribute_name_en', 'N/A')}",
                    f"- Definition: {row.get('definition_en', 'N/A')}",
                ])
            
            content_parts.extend([
                "",
                f"Sector: Doe-het-zelf, Tuin & Dier",
                f"Bron: GS1 Benelux DIY Datamodel v3.1.34.1",
                f"URL: https://www.gs1belu.org/en/documentation/benelux-do-it-yourself-garden-and-pet-datamodel-31341"
            ])
            
            content = "\n".join(content_parts)
            
            item = {
                "title": f"GS1 Benelux DIY - {attr_name_nl[:100]}",
                "content": content,
                "source_type": "gs1_nl_datamodel",
                "sector": "DIY",
                "attribute_name_nl": attr_name_nl,
                "attribute_name_en": str(row.get('attribute_name_en', '')),
                "gdsn_name": str(row.get('gdsn_name', '')),
                "field_id": str(row.get('field_id', '')),
                "url": "https://www.gs1belu.org/en/documentation/benelux-do-it-yourself-garden-and-pet-datamodel-31341",
                "version": "3.1.34.1"
            }
            
            content_items.append(item)
            
        except Exception as e:
            print(f"Error processing row {idx}: {e}")
            continue
    
    # Save to JSON
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(content_items, f, ensure_ascii=False, indent=2)
    
    print(f"Parsed {len(content_items)} DIY datamodel attributes")
    print(f"Output saved to: {output_path}")
    
    # Show sample
    if content_items:
        print(f"\nSample titles:")
        for item in content_items[:5]:
            print(f"  - {item['title']}")
    
    return content_items


if __name__ == '__main__':
    excel_path = 'data/gs1nl/benelux-diy-datamodel-3.1.34.1-file1.xlsx'
    output_path = 'data/gs1nl/diy_datamodel_content.json'
    
    parse_diy_datamodel(excel_path, output_path)
