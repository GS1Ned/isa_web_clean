#!/usr/bin/env python3
"""
Parse GS1 Benelux Healthcare Datamodel Excel file and generate JSON content for ingestion.
"""

import pandas as pd
import json
from pathlib import Path

def parse_healthcare_datamodel(excel_path: str, output_path: str):
    """Parse the Healthcare datamodel Excel file."""
    
    # Read the Attributes sheet, using row 3 as header (0-indexed row 2)
    df = pd.read_excel(excel_path, sheet_name='Attributes', engine='openpyxl', header=2)
    
    # Get the actual column names from the first data row
    # The structure has column headers in row 3
    first_row = df.iloc[0].values
    
    # Create a mapping based on the actual structure
    # Columns: BMS ID, Attribute name English, Attribute Definitions for Business names, 
    # Attribute Definitions for Business definitions, Definition English, 
    # Instruction/Entry notes - English, Examples, ECHO Common Data Set, etc.
    
    # Skip the header row and use remaining data
    df = df.iloc[1:]
    
    # Rename columns based on the structure we observed
    df.columns = [
        'bms_id', 'attribute_name_en', 'business_name', 'business_definition',
        'definition_en', 'instruction_en', 'example', 'echo_common',
        'col8', 'col9', 'col10', 'col11', 'col12', 'col13', 'col14', 'col15',
        'col16', 'col17', 'col18', 'col19'
    ][:len(df.columns)]
    
    # Filter out rows without a valid BMS ID
    df = df[df['bms_id'].notna()]
    df = df[df['bms_id'].apply(lambda x: str(x).replace('.0', '').isdigit() if pd.notna(x) else False)]
    
    content_items = []
    
    for _, row in df.iterrows():
        try:
            # Build content text
            content_parts = [
                f"GS1 Benelux Healthcare Datamodel - Attribuut: {row.get('attribute_name_en', 'N/A')}",
                "",
                "**Identificatie**",
                f"- Attribuutnaam (EN): {row.get('attribute_name_en', 'N/A')}",
                f"- Business naam: {row.get('business_name', 'N/A')}",
                f"- BMS ID: {row.get('bms_id', 'N/A')}",
                "",
                "**Definitie**",
                f"{row.get('definition_en', 'No definition available')}",
            ]
            
            if pd.notna(row.get('business_definition')):
                content_parts.extend([
                    "",
                    "**Business Definitie**",
                    f"{row.get('business_definition')}"
                ])
            
            if pd.notna(row.get('instruction_en')):
                content_parts.extend([
                    "",
                    "**Invulinstructie**",
                    f"{row.get('instruction_en')}"
                ])
            
            if pd.notna(row.get('example')):
                content_parts.extend([
                    "",
                    "**Voorbeeld**",
                    f"{row.get('example')}"
                ])
            
            if pd.notna(row.get('echo_common')):
                content_parts.extend([
                    "",
                    "**ECHO Common Data Set**",
                    f"{row.get('echo_common')}"
                ])
            
            content_parts.extend([
                "",
                f"Bron: GS1 Benelux Healthcare Datamodel (ECHO)",
                f"URL: https://www.gs1belu.org/en/documentation/healthcare-datamodel-3131"
            ])
            
            content = "\n".join(content_parts)
            
            item = {
                "title": f"GS1 Healthcare - {row.get('attribute_name_en', 'Unknown')}",
                "content": content,
                "source_type": "gs1_nl_datamodel",
                "sector": "Healthcare",
                "attribute_name_en": str(row.get('attribute_name_en', '')),
                "business_name": str(row.get('business_name', '')),
                "bms_id": str(row.get('bms_id', '')).replace('.0', ''),
                "url": "https://www.gs1belu.org/en/documentation/healthcare-datamodel-3131",
                "version": "3.1.31"
            }
            
            content_items.append(item)
            
        except Exception as e:
            print(f"Error processing row: {e}")
            continue
    
    # Save to JSON
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(content_items, f, ensure_ascii=False, indent=2)
    
    print(f"Parsed {len(content_items)} Healthcare datamodel attributes")
    print(f"Output saved to: {output_path}")
    
    return content_items


if __name__ == '__main__':
    excel_path = 'data/gs1nl/benelux-healthcare-datamodel-3.1.31.xlsx'
    output_path = 'data/gs1nl/healthcare_datamodel_content.json'
    
    parse_healthcare_datamodel(excel_path, output_path)
