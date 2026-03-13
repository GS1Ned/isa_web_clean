#!/usr/bin/env python3
"""
Parse GS1 Nederland Benelux FMCG Datamodel and generate content for ISA knowledge base.
"""

import pandas as pd
import json
import os
from typing import List, Dict, Any

def parse_fmcg_datamodel(filepath: str) -> List[Dict[str, Any]]:
    """Parse the Benelux FMCG datamodel Excel file and extract attributes."""
    
    # Read the Attributen sheet with header at row 1
    df = pd.read_excel(filepath, sheet_name='Attributen', header=1)
    
    # Get all column names
    columns = df.columns.tolist()
    
    attributes = []
    
    for idx, row in df.iterrows():
        try:
            # Column mapping based on actual Excel structure:
            # Col 0: Lokale attribuutnaam (Dutch name)
            # Col 1: GDSN naam (GDSN name)
            # Col 2: BMS ID
            # Col 3: TC Field ID
            # Col 5: Definitie (Definition)
            # Col 6: Voorbeeld (Example)
            # Col 7: Instructies (Instructions)
            # Col 8: Opmerkingen (Remarks)
            
            attr = {
                'attribute_name_nl': str(row.iloc[0]) if pd.notna(row.iloc[0]) else None,
                'gdsn_name': str(row.iloc[1]) if pd.notna(row.iloc[1]) else None,
                'bms_id': str(row.iloc[2]) if pd.notna(row.iloc[2]) else None,
                'tc_field_id': str(row.iloc[3]) if pd.notna(row.iloc[3]) else None,
                'definition_nl': str(row.iloc[5]) if pd.notna(row.iloc[5]) else None,
                'example': str(row.iloc[6]) if pd.notna(row.iloc[6]) else None,
                'instruction_nl': str(row.iloc[7]) if pd.notna(row.iloc[7]) else None,
                'remarks': str(row.iloc[8]) if pd.notna(row.iloc[8]) else None,
            }
            
            # Try to get additional columns if they exist
            if len(row) > 19:
                attr['data_type'] = str(row.iloc[19]) if pd.notna(row.iloc[19]) else None
            if len(row) > 20:
                attr['max_length'] = str(row.iloc[20]) if pd.notna(row.iloc[20]) else None
            if len(row) > 21:
                attr['code_list'] = str(row.iloc[21]) if pd.notna(row.iloc[21]) else None
            if len(row) > 23:
                attr['model_layer'] = str(row.iloc[23]) if pd.notna(row.iloc[23]) else None
            if len(row) > 39:
                attr['gdsn_xpath'] = str(row.iloc[39]) if pd.notna(row.iloc[39]) else None
            
            # Only add if we have at least an attribute name
            if attr['attribute_name_nl'] and attr['attribute_name_nl'] != 'nan':
                attributes.append(attr)
        except Exception as e:
            print(f"Error parsing row {idx}: {e}")
            continue
    
    return attributes


def parse_code_lists(filepath: str) -> List[Dict[str, Any]]:
    """Parse the Codelijsten (code lists) sheet."""
    
    df = pd.read_excel(filepath, sheet_name='Codelijsten', header=None)
    
    code_lists = {}
    current_list_name = None
    
    for idx in range(len(df)):
        row = df.iloc[idx]
        try:
            col0 = str(row.iloc[0]).strip() if pd.notna(row.iloc[0]) else ''
            col1 = str(row.iloc[1]).strip() if len(row) > 1 and pd.notna(row.iloc[1]) else ''
            col2 = str(row.iloc[2]).strip() if len(row) > 2 and pd.notna(row.iloc[2]) else ''
            
            # Skip empty rows
            if not col0 or col0 == 'nan':
                continue
            
            # Check if this looks like a code list header (usually longer text or specific format)
            if col1 and not col1.startswith('http') and len(col0) < 100:
                # This is likely a code entry
                if current_list_name:
                    if current_list_name not in code_lists:
                        code_lists[current_list_name] = []
                    code_lists[current_list_name].append({
                        'code': col0,
                        'description_nl': col1,
                        'description_en': col2 if col2 and col2 != 'nan' else None
                    })
            elif not col1 or col1 == 'nan':
                # This might be a header
                current_list_name = col0
                
        except Exception as e:
            continue
    
    # Convert to list format
    result = []
    for name, codes in code_lists.items():
        if codes and len(codes) >= 2:
            result.append({
                'name': name,
                'codes': codes
            })
    
    return result


def generate_knowledge_content(attributes: List[Dict], code_lists: List[Dict], sector: str, version: str) -> List[Dict[str, Any]]:
    """Generate knowledge base content from parsed datamodel."""
    
    content_items = []
    
    # Clean up None/nan values
    def clean(val):
        if val is None or val == 'nan' or val == 'None' or val == 'NaN':
            return 'N/A'
        return str(val).strip()
    
    # Generate content for each attribute
    for attr in attributes:
        if not attr.get('attribute_name_nl'):
            continue
            
        content = f"""GS1 Benelux {sector} Datamodel - Attribuut: {clean(attr['attribute_name_nl'])}

**Identificatie**
- Lokale attribuutnaam (NL): {clean(attr.get('attribute_name_nl'))}
- GDSN naam: {clean(attr.get('gdsn_name'))}
- BMS ID: {clean(attr.get('bms_id'))}
- TC Field ID: {clean(attr.get('tc_field_id'))}

**Definitie**
{clean(attr.get('definition_nl'))}

**Invulinstructie**
{clean(attr.get('instruction_nl'))}

**Voorbeeld**: {clean(attr.get('example'))}

**Opmerkingen**: {clean(attr.get('remarks'))}

**Technische specificaties**
- Data type: {clean(attr.get('data_type'))}
- Maximale lengte: {clean(attr.get('max_length'))}
- Codelijst: {clean(attr.get('code_list'))}
- Model laag: {clean(attr.get('model_layer'))}

**GDSN XPath**: {clean(attr.get('gdsn_xpath'))}

Bron: GS1 Benelux {sector} Datamodel versie {version}
URL: https://www.gs1.nl/kennisbank/gs1-data-source/levensmiddelen-drogisterij/welke-data/datamodel/
"""
        
        content_items.append({
            'title': f"GS1 Benelux {sector} - {attr['attribute_name_nl']}",
            'content': content,
            'source_type': 'gs1_nl_datamodel',
            'sector': sector,
            'attribute_name_nl': attr.get('attribute_name_nl'),
            'gdsn_name': attr.get('gdsn_name'),
            'bms_id': attr.get('bms_id'),
            'model_layer': attr.get('model_layer'),
            'data_type': attr.get('data_type'),
            'url': 'https://www.gs1.nl/kennisbank/gs1-data-source/levensmiddelen-drogisterij/welke-data/datamodel/',
            'version': version
        })
    
    # Generate content for code lists
    for cl in code_lists:
        if not cl.get('name') or not cl.get('codes'):
            continue
        
        # Limit codes shown in content
        max_codes = 100
        codes_text = "\n".join([
            f"  - {c.get('code', 'N/A')}: {c.get('description_nl', 'N/A')}"
            for c in cl['codes'][:max_codes]
        ])
        
        more_text = f"\n  ... en {len(cl['codes']) - max_codes} meer" if len(cl['codes']) > max_codes else ""
        
        content = f"""GS1 Benelux {sector} Codelijst: {cl['name']}

Deze codelijst bevat {len(cl['codes'])} waarden die gebruikt kunnen worden in GS1 Data Source voor de {sector} sector.

**Codes:**
{codes_text}{more_text}

Bron: GS1 Benelux {sector} Datamodel versie {version}
URL: https://www.gs1.nl/kennisbank/gs1-data-source/levensmiddelen-drogisterij/welke-data/datamodel/
"""
        
        content_items.append({
            'title': f"GS1 Benelux {sector} Codelijst - {cl['name']}",
            'content': content,
            'source_type': 'gs1_nl_codelist',
            'sector': sector,
            'code_list_name': cl['name'],
            'code_count': len(cl['codes']),
            'url': 'https://www.gs1.nl/kennisbank/gs1-data-source/levensmiddelen-drogisterij/welke-data/datamodel/',
            'version': version
        })
    
    return content_items


def main():
    """Main function to parse datamodel and generate content."""
    
    filepath = 'data/gs1nl/benelux-fmcg-datamodel-3.1.34.2.xlsx'
    version = '3.1.34.2'
    
    print("Parsing FMCG datamodel attributes...")
    attributes = parse_fmcg_datamodel(filepath)
    print(f"Found {len(attributes)} attributes")
    
    # Print sample attribute to verify parsing
    if attributes:
        print("\nSample attribute:")
        sample = attributes[0]
        for k, v in sample.items():
            val_str = str(v)[:80] if v else 'None'
            print(f"  {k}: {val_str}")
    
    print("\nParsing code lists...")
    code_lists = parse_code_lists(filepath)
    print(f"Found {len(code_lists)} code lists")
    
    # Print code list names
    if code_lists:
        print("Code lists found:")
        for cl in code_lists[:5]:
            print(f"  - {cl['name']}: {len(cl['codes'])} codes")
    
    print("\nGenerating knowledge content...")
    content_items = generate_knowledge_content(attributes, code_lists, 'FMCG', version)
    print(f"Generated {len(content_items)} content items")
    
    # Save to JSON for further processing
    output_path = 'data/gs1nl/fmcg_datamodel_content.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(content_items, f, ensure_ascii=False, indent=2)
    print(f"\nSaved content to {output_path}")
    
    # Print sample content
    if content_items:
        print("\n--- Sample content item ---")
        print(content_items[0]['content'][:1000])


if __name__ == '__main__':
    main()
