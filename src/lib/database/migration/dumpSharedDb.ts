import { Client } from 'pg';

export async function dumpDatabaseSchemaPureNode(connectionString: string): Promise<string> {
  if (!connectionString.startsWith('postgres://') &&
      !connectionString.startsWith('postgresql://')) {
    throw new Error('Invalid connection string format - must start with postgres:// or postgresql://');
  }

  const client = new Client({ connectionString });
  const schemaName = 'public'; // Main focus for general schema dump
  
  const requiredExtensions = new Set<string>(); 
  let mainDdlStatements = ''; 
  let schemaSectionComments = '';

  try {
    console.log(`Connecting to database for dumping schema elements...`);
    await client.connect();
    console.log("Connected for dumping schema elements.");

    const versionRes = await client.query("SHOW server_version;");
    console.log(`Connected to PostgreSQL server version: ${versionRes.rows[0].server_version}`);

    schemaSectionComments += `\n--\n-- Schema: ${schemaName}\n--\n`;

    // 1. Get Enum Types in the 'public' schema
    console.log(`Fetching enum types for schema ${schemaName}...`);
    const enumTypesRes = await client.query(`
      SELECT t.typname AS enum_name, array_agg(e.enumlabel::text ORDER BY e.enumsortorder) AS enum_labels
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE n.nspname = $1 AND t.typtype = 'e'
      GROUP BY n.nspname, t.typname
      ORDER BY t.typname;
    `, [schemaName]);

    if (enumTypesRes.rows.length > 0) {
        mainDdlStatements += `\n--\n-- Enum Types for schema ${schemaName}\n--\n`;
    }
    for (const enumRow of enumTypesRes.rows) {
      if (Array.isArray(enumRow.enum_labels) && enumRow.enum_labels.length > 0) {
        const enumLabels = enumRow.enum_labels.map((label: string) => `'${label.replace(/'/g, "''")}'`).join(', ');
        mainDdlStatements += `CREATE TYPE "${schemaName}"."${enumRow.enum_name}" AS ENUM (${enumLabels});\n\n`;
      } else {
        console.warn(`WARN: Enum "${schemaName}"."${enumRow.enum_name}" has no labels. Skipping. Labels: ${JSON.stringify(enumRow.enum_labels)}`);
        mainDdlStatements += `-- WARN: Could not generate DDL for enum "${schemaName}"."${enumRow.enum_name}" due to missing labels.\n\n`;
      }
    }

    // 2. Get Sequences in the 'public' schema (Manual Method)
    console.log(`Fetching sequences for schema ${schemaName} (manual method)...`);
    const sequencesRes = await client.query(`
        SELECT
          c.relname AS sequence_name, s.seqstart, s.seqincrement, s.seqmax, s.seqmin, s.seqcache, s.seqcycle,
          CASE
            WHEN EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'pg_sequence'::regclass AND attname = 'seqtypid')
            THEN (SELECT format_type(s_inner.seqtypid, NULL) FROM pg_sequence s_inner WHERE s_inner.seqrelid = c.oid)
            ELSE 'bigint'
          END AS sequence_data_type
        FROM pg_catalog.pg_class c
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        JOIN pg_catalog.pg_sequence s ON s.seqrelid = c.oid
        WHERE c.relkind = 'S' AND n.nspname = $1
          AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid = 'pg_class'::regclass AND d.objid = c.oid AND d.deptype = 'e')
        ORDER BY c.relname;
    `, [schemaName]);

    if (sequencesRes.rows.length > 0) {
      mainDdlStatements += `\n--\n-- Sequences (CREATE statements) for schema ${schemaName}\n--\n`;
      for (const seqRow of sequencesRes.rows) {
        let seqDef = `CREATE SEQUENCE "${schemaName}"."${seqRow.sequence_name}"`;
        if (seqRow.sequence_data_type && seqRow.sequence_data_type !== 'bigint') {
            seqDef += `\n    AS ${seqRow.sequence_data_type}`;
        }
        seqDef += `\n    START WITH ${seqRow.seqstart}\n    INCREMENT BY ${seqRow.seqincrement}\n    MINVALUE ${seqRow.seqmin}\n    MAXVALUE ${seqRow.seqmax}\n    CACHE ${seqRow.seqcache}`;
        if (seqRow.seqcycle) seqDef += `\n    CYCLE`;
        seqDef += ';\n\n';
        mainDdlStatements += seqDef;
      }
    }

    // 3. Get Tables and Columns in the 'public' schema
    console.log(`Fetching tables for schema ${schemaName}...`);
    const tablesRes = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = $1 AND table_type = 'BASE TABLE' ORDER BY table_name;
    `, [schemaName]);

    if (tablesRes.rows.length > 0) {
        mainDdlStatements += `\n--\n-- Tables for schema ${schemaName}\n--\n`;
    }
    for (const tableRow of tablesRes.rows) {
      const tableName = tableRow.table_name;
      mainDdlStatements += `CREATE TABLE "${schemaName}"."${tableName}" (\n`;

      const columnsRes = await client.query(`
        SELECT
          c.column_name, c.data_type, c.udt_name,
          COALESCE(ns_udt.nspname, ns_element_udt.nspname) as udt_schema,
          c.is_nullable, c.column_default, c.character_maximum_length,
          c.numeric_precision, c.numeric_scale, c.domain_name,
          COALESCE(ns_domain.nspname, c.domain_schema) as domain_actual_schema
        FROM information_schema.columns c
        LEFT JOIN pg_catalog.pg_type type_info ON type_info.typname = c.udt_name
        LEFT JOIN pg_catalog.pg_namespace ns_udt ON ns_udt.oid = type_info.typnamespace AND c.data_type = 'USER-DEFINED'
        LEFT JOIN pg_catalog.pg_type element_type_info ON element_type_info.oid = type_info.typelem AND c.data_type = 'ARRAY'
        LEFT JOIN pg_catalog.pg_namespace ns_element_udt ON ns_element_udt.oid = element_type_info.typnamespace AND c.data_type = 'ARRAY'
        LEFT JOIN pg_catalog.pg_type domain_type_info ON domain_type_info.typname = c.domain_name AND c.domain_schema IS NOT NULL
        LEFT JOIN pg_catalog.pg_namespace ns_domain ON ns_domain.oid = domain_type_info.typnamespace
        WHERE c.table_schema = $1 AND c.table_name = $2 ORDER BY c.ordinal_position;
      `, [schemaName, tableName]);

      const columnDefinitions = columnsRes.rows.map(col => {
        let colDef = `  "${col.column_name}" `;
        let typeName = col.data_type;
        const knownBuiltInBaseTypes = ['text', 'varchar', 'char', 'int2', 'int4', 'int8', 'numeric', 'float4', 'float8', 'bool', 'date', 'timestamp', 'timestamptz', 'json', 'jsonb', 'uuid', 'bytea', 'interval', 'time', 'timetz', 'money', 'oid', 'name', 'xid', 'cid', 'tid', 'boolean', 'integer', 'bigint', 'smallint', 'real', 'double precision'];
        const baseTypeUdtName = col.udt_name && col.udt_name.startsWith('_') ? col.udt_name.substring(1) : col.udt_name;
        let udtActualSchema = col.udt_schema;

        if (col.domain_name) {
          const domainActualSchema = col.domain_actual_schema || schemaName;
          typeName = `"${domainActualSchema}"."${col.domain_name}"`;
        } else if (col.data_type === 'USER-DEFINED') {
          udtActualSchema = udtActualSchema || schemaName;
          typeName = `"${udtActualSchema}"."${col.udt_name}"`;
          if (udtActualSchema === 'extensions' && col.udt_name === 'vector') {
            requiredExtensions.add('vector');
          }
        } else if (col.data_type === 'ARRAY') {
          const isBuiltInArrayElement = knownBuiltInBaseTypes.includes(baseTypeUdtName);
          if (isBuiltInArrayElement) {
            typeName = `${baseTypeUdtName}[]`;
          } else {
            udtActualSchema = udtActualSchema || schemaName;
            typeName = `"${udtActualSchema}"."${baseTypeUdtName}"[]`;
            if (udtActualSchema === 'extensions' && baseTypeUdtName === 'vector') {
              requiredExtensions.add('vector');
            }
          }
        } else if (col.data_type === 'character varying' && col.character_maximum_length) {
          typeName = `varchar(${col.character_maximum_length})`;
        } else if (col.data_type === 'character' && col.character_maximum_length) {
          typeName = `char(${col.character_maximum_length})`;
        } else if (col.data_type === 'numeric' && col.numeric_precision) {
          typeName = `numeric(${col.numeric_precision}${col.numeric_scale ? ',' + col.numeric_scale : ''})`;
        }
        if (typeName === 'timestamp with time zone') typeName = 'timestamptz';
        if (typeName === 'timestamp without time zone') typeName = 'timestamp';
        if (typeName === 'time with time zone') typeName = 'timetz';
        if (typeName === 'time without time zone') typeName = 'time';
        if (typeName === 'double precision') typeName = 'float8';
        if (typeName === 'real') typeName = 'float4';
        if (typeName === 'integer') typeName = 'int4';
        if (typeName === 'smallint') typeName = 'int2';
        if (typeName === 'bigint') typeName = 'int8';
        if (typeName === 'boolean') typeName = 'bool';

        colDef += typeName;
        if (col.is_nullable === 'NO') colDef += ' NOT NULL';
        if (col.column_default !== null) colDef += ` DEFAULT ${col.column_default}`;
        return colDef;
      });
      mainDdlStatements += columnDefinitions.join(',\n');
      mainDdlStatements += '\n);\n\n';

      const pkRes = await client.query(`
          SELECT kcu.column_name, tc.constraint_name FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
          WHERE tc.table_schema = $1 AND tc.table_name = $2 AND tc.constraint_type = 'PRIMARY KEY' ORDER BY kcu.ordinal_position;
      `, [schemaName, tableName]);
      if (pkRes.rowCount && pkRes.rowCount > 0) {
          const pkColumns = pkRes.rows.map(r => `"${r.column_name}"`).join(', ');
          mainDdlStatements += `ALTER TABLE "${schemaName}"."${tableName}" ADD CONSTRAINT "${pkRes.rows[0].constraint_name}" PRIMARY KEY (${pkColumns});\n\n`;
      }
    }

    // 4. Get Functions in the 'public' schema
    console.log(`Fetching functions for schema ${schemaName}...`);
    const functionsRes = await client.query(`
      SELECT pg_catalog.pg_get_functiondef(p.oid) AS function_definition FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = $1 AND p.prokind IN ('f', 'p', 'a')
        AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND (d.deptype = 'e' OR d.deptype = 'i'))
      ORDER BY p.proname;
    `, [schemaName]);
    if (functionsRes.rows.length > 0) mainDdlStatements += `\n--\n-- Functions for schema ${schemaName}\n--\n`;
    for (const funcRow of functionsRes.rows) {
      mainDdlStatements += `${funcRow.function_definition.trim().endsWith(';') ? funcRow.function_definition : funcRow.function_definition + ';'}\n\n`;
    }

    // 5. Row Level Security (RLS) for 'public' schema
    console.log(`Fetching RLS configurations for schema ${schemaName}...`);
    let rlsDdlForPublicSchema = '';
    if (tablesRes.rows.length > 0) { 
        for (const tableRow of tablesRes.rows) {
            const tableName = tableRow.table_name;
            let tableRlsStatements = '';

            const rlsStatusRes = await client.query(`
                SELECT c.relrowsecurity
                FROM pg_catalog.pg_class c
                JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                WHERE n.nspname = $1 AND c.relname = $2 AND c.relkind = 'r';
            `, [schemaName, tableName]);

            if (rlsStatusRes.rows.length > 0 && rlsStatusRes.rows[0].relrowsecurity) {
                tableRlsStatements += `\n-- RLS for table "${schemaName}"."${tableName}"\n`;
                tableRlsStatements += `ALTER TABLE "${schemaName}"."${tableName}" ENABLE ROW LEVEL SECURITY;\n\n`;

                const policiesRes = await client.query(`
                    SELECT
                        p.polname,
                        p.polcmd,
                        p.polpermissive,
                        pg_catalog.pg_get_expr(p.polqual, p.polrelid, true) AS using_expression,
                        pg_catalog.pg_get_expr(p.polwithcheck, p.polrelid, true) AS check_expression,
                        CASE
                            WHEN p.polroles = '{0}' THEN ARRAY['PUBLIC']::text[]
                            ELSE (
                                SELECT array_agg(r.rolname::text ORDER BY r.rolname)
                                FROM pg_catalog.pg_roles r
                                WHERE r.oid = ANY(p.polroles)
                            )
                        END AS roles
                    FROM pg_catalog.pg_policy p
                    JOIN pg_catalog.pg_class c ON c.oid = p.polrelid
                    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                    WHERE n.nspname = $1 AND c.relname = $2
                    ORDER BY p.polname;
                `, [schemaName, tableName]);

                for (const policy of policiesRes.rows) {
                    let policyDef = `CREATE POLICY "${policy.polname.replace(/"/g, '""')}" ON "${schemaName}"."${tableName}"`;
                    policyDef += ` AS ${policy.polpermissive ? 'PERMISSIVE' : 'RESTRICTIVE'}`;
                    const commandMap: { [key: string]: string } = { 'r': 'SELECT', 'a': 'INSERT', 'w': 'UPDATE', 'd': 'DELETE', '*': 'ALL' };
                    policyDef += ` FOR ${commandMap[policy.polcmd] || 'ALL'}`;
                    if (policy.roles && policy.roles.length > 0) {
                        policyDef += ` TO ${policy.roles.map((r: string) => r === 'PUBLIC' ? 'PUBLIC' : `"${r.replace(/"/g, '""')}"`).join(', ')}`;
                    }
                    if (policy.using_expression) policyDef += `\n    USING (${policy.using_expression})`;
                    if (policy.check_expression) policyDef += `\n    WITH CHECK (${policy.check_expression})`;
                    policyDef += ';\n\n';
                    tableRlsStatements += policyDef;
                }
            }
            if (tableRlsStatements) rlsDdlForPublicSchema += tableRlsStatements;
        }
    }
    if (rlsDdlForPublicSchema) {
        mainDdlStatements += `\n--\n-- Row Level Security for schema ${schemaName}\n--\n`;
        mainDdlStatements += rlsDdlForPublicSchema;
    }
    
    // 6. Row Level Security (RLS) definitions for 'storage' schema tables (buckets, objects) - COMMENTED OUT
    console.log(`Fetching RLS configurations for 'storage' schema tables (buckets, objects)...`);
    let storageRlsDdl = '';
    const storageSchemaName = 'storage';
    const storageTablesToProcess = ['buckets', 'objects']; 

    for (const storageTableName of storageTablesToProcess) {
        const tableExistsRes = await client.query(
            "SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2",
            [storageSchemaName, storageTableName]
        );
        if (tableExistsRes.rowCount === 0) {
            console.log(`Table "${storageSchemaName}"."${storageTableName}" not found. Skipping RLS for it.`);
            continue;
        }

        let tablePolicyStatements = '';
        const policiesRes = await client.query(`
            SELECT
                p.polname,
                p.polcmd,
                p.polpermissive,
                pg_catalog.pg_get_expr(p.polqual, p.polrelid, true) AS using_expression,
                pg_catalog.pg_get_expr(p.polwithcheck, p.polrelid, true) AS check_expression,
                CASE
                    WHEN p.polroles = '{0}' THEN ARRAY['PUBLIC']::text[]
                    ELSE (
                        SELECT array_agg(r.rolname::text ORDER BY r.rolname)
                        FROM pg_catalog.pg_roles r
                        WHERE r.oid = ANY(p.polroles)
                    )
                END AS roles
            FROM pg_catalog.pg_policy p
            JOIN pg_catalog.pg_class c ON c.oid = p.polrelid
            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = $1 AND c.relname = $2
            ORDER BY p.polname;
        `, [storageSchemaName, storageTableName]);

        if (policiesRes.rows.length > 0) {
            tablePolicyStatements += `\n-- Policies for table "${storageSchemaName}"."${storageTableName}"\n`;
            tablePolicyStatements += `-- IMPORTANT: These policies for the 'storage' schema are COMMENTED OUT.\n`;
            tablePolicyStatements += `-- Re-create these policies using the Supabase Dashboard or client libraries.\n\n`;
        }

        for (const policy of policiesRes.rows) {
            let policyDef = `CREATE POLICY "${policy.polname.replace(/"/g, '""')}" ON "${storageSchemaName}"."${storageTableName}"`;
            policyDef += ` AS ${policy.polpermissive ? 'PERMISSIVE' : 'RESTRICTIVE'}`;
            const commandMap: { [key: string]: string } = { 'r': 'SELECT', 'a': 'INSERT', 'w': 'UPDATE', 'd': 'DELETE', '*': 'ALL' };
            policyDef += ` FOR ${commandMap[policy.polcmd] || 'ALL'}`;
            if (policy.roles && policy.roles.length > 0) {
                policyDef += ` TO ${policy.roles.map((r: string) => r === 'PUBLIC' ? 'PUBLIC' : `"${r.replace(/"/g, '""')}"`).join(', ')}`;
            }
            if (policy.using_expression) policyDef += `\n    USING (${policy.using_expression})`;
            if (policy.check_expression) policyDef += `\n    WITH CHECK (${policy.check_expression})`;
            policyDef += ';\n'; 
            tablePolicyStatements += policyDef.split('\n').map(line => `-- ${line}`).join('\n') + '\n\n';
        }
        if (tablePolicyStatements) storageRlsDdl += tablePolicyStatements;
    }
    if (storageRlsDdl) {
        mainDdlStatements += `\n--\n-- Row Level Security Policy Definitions for 'storage' schema tables (buckets, objects)\n--\n`;
        mainDdlStatements += storageRlsDdl;
    }

    // 7. Get Sequence OWNED BY clauses for 'public' schema
    console.log(`Fetching sequence OWNED BY clauses for schema ${schemaName}...`);
    const ownedByRes = await client.query(`
        SELECT seq_ns.nspname AS seq_sch, seq_c.relname AS seq_name, tbl_ns.nspname AS tbl_sch, tbl_c.relname AS tbl_name, a.attname AS col_name
        FROM pg_catalog.pg_depend d JOIN pg_catalog.pg_class seq_c ON seq_c.oid = d.objid JOIN pg_catalog.pg_namespace seq_ns ON seq_ns.oid = seq_c.relnamespace
        JOIN pg_catalog.pg_class tbl_c ON tbl_c.oid = d.refobjid JOIN pg_catalog.pg_namespace tbl_ns ON tbl_ns.oid = tbl_c.relnamespace
        JOIN pg_catalog.pg_attribute a ON a.attrelid = d.refobjid AND a.attnum = d.refobjsubid
        WHERE d.classid = 'pg_class'::regclass AND d.refclassid = 'pg_class'::regclass AND d.deptype = 'a'
          AND seq_c.relkind = 'S' AND seq_ns.nspname = $1;
    `, [schemaName]); 
    if (ownedByRes.rows.length > 0) {
      mainDdlStatements += `\n--\n-- Sequence OWNED BY clauses for schema ${schemaName}\n--\n`;
      for (const row of ownedByRes.rows) {
        mainDdlStatements += `ALTER SEQUENCE "${row.seq_sch}"."${row.seq_name}" OWNED BY "${row.tbl_sch}"."${row.tbl_name}"."${row.col_name}";\n\n`;
      }
    }

    // 8. Indexes (excluding PK constraints) for 'public' schema
    console.log(`Fetching indexes for schema ${schemaName}...`);
    if (tablesRes.rows.length > 0) mainDdlStatements += `\n--\n-- Indexes for schema ${schemaName}\n--\n`;
    for (const tableRow of tablesRes.rows) { 
        const tableName = tableRow.table_name;
        const indexesRes = await client.query(`
            SELECT indexdef FROM pg_indexes WHERE schemaname = $1 AND tablename = $2
              AND indexname NOT IN (SELECT conname FROM pg_constraint WHERE contype = 'p' AND conrelid = (
                  SELECT c.oid FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = $2 AND n.nspname = $1));
        `, [schemaName, tableName]);
        for (const indexRow of indexesRes.rows) {
            mainDdlStatements += `${indexRow.indexdef.endsWith(';') ? indexRow.indexdef : indexRow.indexdef + ';'}\n\n`;
        }
    }

    // 9. Foreign Key Constraints for 'public' schema
    console.log(`Fetching foreign key constraints for schema ${schemaName}...`);
    const fkRes = await client.query(`
        SELECT
            c.conname AS constraint_name,
            conrelid::regclass::text AS fk_table_fq_name,
            pg_catalog.pg_get_constraintdef(c.oid, true) AS constraint_definition
        FROM
            pg_catalog.pg_constraint c
        JOIN
            pg_catalog.pg_class rel ON rel.oid = c.conrelid
        JOIN
            pg_catalog.pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE
            nsp.nspname = $1 
            AND c.contype = 'f'
        ORDER BY
            rel.relname, c.conname;
    `, [schemaName]);

    if (fkRes.rows.length > 0) {
        mainDdlStatements += `\n--\n-- Foreign Key Constraints for schema ${schemaName}\n--\n`;
        for (const fkRow of fkRes.rows) {
            mainDdlStatements += `ALTER TABLE ${fkRow.fk_table_fq_name} ADD CONSTRAINT "${fkRow.constraint_name.replace(/"/g, '""')}" ${fkRow.constraint_definition};\n\n`;
        }
    }

    // 10. Get Views in 'public' schema
    console.log(`Fetching views for schema ${schemaName}...`);
    const viewsRes = await client.query(`SELECT viewname, definition FROM pg_catalog.pg_views WHERE schemaname = $1 ORDER BY viewname;`, [schemaName]);
    if (viewsRes.rows.length > 0) mainDdlStatements += `\n--\n-- Views for schema ${schemaName}\n--\n`;
    for (const viewRow of viewsRes.rows) {
      mainDdlStatements += `CREATE OR REPLACE VIEW "${schemaName}"."${viewRow.viewname}" AS\n${viewRow.definition.trim().endsWith(';') ? viewRow.definition : viewRow.definition + ';'}\n\n`;
    }

    // --- Construct the initial setup SQL based on detected requirements ---
    let initialSetupSQL = '';
    const searchPathArray = [`"${schemaName}"`]; 

    if (requiredExtensions.has('vector')) {
        initialSetupSQL += `CREATE SCHEMA IF NOT EXISTS extensions;\n`;
        initialSetupSQL += `CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;\n\n`;
        searchPathArray.push('extensions');
    }
    
    initialSetupSQL += `CREATE SCHEMA IF NOT EXISTS "${schemaName}";\n`; 
    initialSetupSQL += `\n`;

    if (schemaName !== 'public' && !searchPathArray.includes('public')) { 
        searchPathArray.push('public');
    }
    
    initialSetupSQL += `SET search_path = ${searchPathArray.join(', ')};\n\n`;
    
    const headerComment = `-- Schema dump for '${schemaName}' schema (and 'storage' RLS definitions) generated by Node.js script at ${new Date().toISOString()}\n\n`;
    const finalResetSQL = `SET search_path TO "$user", public;\n\n`;

    console.log(`Schema dump generation complete.`);
    return headerComment + initialSetupSQL + schemaSectionComments + mainDdlStatements + finalResetSQL;

  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`Error generating schema dump:`, err.message, err.stack);
      throw err;
    } else {
      console.error(`Unknown error generating schema dump`);
      throw new Error(`Unknown error during schema dump`);
    }
  } finally {
    if (client && (client as any)._connected) {
        console.log("Closing database connection (dumping schema).");
        await client.end();
    } else {
        console.log("Client (dumping schema) was not connected or already closed.");
    }
  }
}