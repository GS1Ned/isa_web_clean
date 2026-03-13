"""
Generate Postgres schema stubs for all MySQL tables that are missing from drizzle_pg/schema.ts.
This reads the MySQL schema, extracts table definitions, and converts them to Postgres equivalents.
"""
import re

def camel_to_snake(name):
    """Convert camelCase to snake_case"""
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

def extract_mysql_tables(content):
    """Extract all MySQL table definitions"""
    tables = {}
    # Match: export const tableName = mysqlTable("table_name", { ... });
    pattern = r'export const (\w+)\s*=\s*mysqlTable\("([^"]+)",\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}'
    for m in re.finditer(pattern, content, re.DOTALL):
        var_name = m.group(1)
        table_name = m.group(2)
        columns_block = m.group(3)
        tables[var_name] = {
            'table_name': table_name,
            'columns': columns_block.strip()
        }
    return tables

def convert_column(col_line, table_name):
    """Convert a MySQL column definition to Postgres"""
    col_line = col_line.strip().rstrip(',')
    if not col_line or col_line.startswith('//') or col_line.startswith('/*'):
        return None
    
    # Extract column name and definition
    m = re.match(r'(\w+):\s*(.+)', col_line)
    if not m:
        return None
    
    col_name = m.group(1)
    col_def = m.group(2).strip()
    snake_col = camel_to_snake(col_name)
    
    # Convert types
    pg_def = convert_type(col_name, snake_col, col_def)
    return f'    {col_name}: {pg_def}'

def convert_type(col_name, snake_col, mysql_def):
    """Convert MySQL column type to Postgres"""
    # Auto-increment int -> serial
    if 'autoincrement' in mysql_def:
        result = f'serial("{snake_col}").primaryKey()'
        return result
    
    # int/tinyint -> integer
    if mysql_def.startswith('int(') or mysql_def.startswith('int.') or mysql_def == 'int()':
        result = f'integer("{snake_col}")'
    elif mysql_def.startswith('tinyint'):
        result = f'integer("{snake_col}")'
    elif mysql_def.startswith('bigint'):
        result = f'bigint("{snake_col}", {{ mode: "number" }})'
    # varchar
    elif 'varchar' in mysql_def:
        length_m = re.search(r'length:\s*(\d+)', mysql_def)
        length = length_m.group(1) if length_m else '255'
        result = f'varchar("{snake_col}", {{ length: {length} }})'
    # text
    elif mysql_def.startswith('text(') or mysql_def.startswith('text.'):
        result = f'text("{snake_col}")'
    # json
    elif mysql_def.startswith('json(') or mysql_def.startswith('json.'):
        result = f'jsonb("{snake_col}")'
    # timestamp
    elif 'timestamp' in mysql_def:
        result = f'timestamp("{snake_col}", {{ withTimezone: true, mode: "string" }})'
    # datetime
    elif 'datetime' in mysql_def:
        result = f'timestamp("{snake_col}", {{ withTimezone: true, mode: "string" }})'
    # boolean
    elif 'boolean' in mysql_def:
        result = f'boolean("{snake_col}")'
    # float/double/decimal
    elif 'float' in mysql_def or 'double' in mysql_def:
        result = f'numeric("{snake_col}")'
    elif 'decimal' in mysql_def:
        result = f'numeric("{snake_col}")'
    # mysqlEnum -> varchar (simplified)
    elif 'mysqlEnum' in mysql_def:
        result = f'varchar("{snake_col}", {{ length: 64 }})'
    else:
        # Default to text
        result = f'text("{snake_col}")'
    
    # Add modifiers
    if '.notNull()' in mysql_def:
        result += '.notNull()'
    if '.default(' in mysql_def:
        default_m = re.search(r"\.default\(([^)]+)\)", mysql_def)
        if default_m:
            default_val = default_m.group(1)
            if default_val == "'CURRENT_TIMESTAMP'" or 'CURRENT_TIMESTAMP' in default_val:
                result += '.defaultNow()'
            elif default_val in ('0', '1', 'true', 'false'):
                result += f'.default({default_val})'
            else:
                result += f'.default({default_val})'
    elif '.defaultNow()' in mysql_def:
        result += '.defaultNow()'
    
    return result

def main():
    with open('drizzle/schema.ts') as f:
        mysql_content = f.read()
    
    with open('drizzle_pg/schema.ts') as f:
        pg_content = f.read()
    
    # Get existing PG exports
    pg_exports = set(re.findall(r'export const (\w+)\s*=\s*pgTable', pg_content))
    
    # Get MySQL tables
    mysql_tables = extract_mysql_tables(mysql_content)
    
    # Find missing tables
    missing = {k: v for k, v in mysql_tables.items() if k not in pg_exports}
    
    print(f"// Missing tables to add: {len(missing)}")
    
    # Generate PG stubs
    output_lines = []
    output_lines.append("")
    output_lines.append("// ---------------------------------------------------------------------------")
    output_lines.append("// Auto-generated Postgres stubs for remaining MySQL tables")
    output_lines.append("// These ensure all server imports resolve correctly")
    output_lines.append("// ---------------------------------------------------------------------------")
    output_lines.append("")
    
    for var_name, table_info in sorted(missing.items()):
        table_name = table_info['table_name']
        columns_raw = table_info['columns']
        
        # Parse columns
        pg_columns = []
        for line in columns_raw.split('\n'):
            line = line.strip()
            if not line or line.startswith('//') or line.startswith('/*') or line.startswith('*'):
                continue
            converted = convert_column(line, table_name)
            if converted:
                pg_columns.append(converted)
        
        # Check if we have an id column, if not add one
        has_id = any('serial(' in c for c in pg_columns)
        if not has_id:
            pg_columns.insert(0, f'    id: serial("id").primaryKey()')
        
        output_lines.append(f'export const {var_name} = pgTable(')
        output_lines.append(f'  "{table_name}",')
        output_lines.append('  {')
        output_lines.append(',\n'.join(pg_columns))
        output_lines.append('  }')
        output_lines.append(');')
        output_lines.append('')
    
    result = '\n'.join(output_lines)
    print(result)
    
    # Write to file
    with open('/tmp/pg_schema_stubs.ts', 'w') as f:
        f.write(result)
    
    print(f"\n// Written {len(missing)} table stubs to /tmp/pg_schema_stubs.ts")

main()
