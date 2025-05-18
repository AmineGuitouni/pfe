import { Client } from 'pg';

export async function applySchema(connectionString: string, sqlContent: string): Promise<void> {
  if (!connectionString.startsWith('postgres://') &&
      !connectionString.startsWith('postgresql://')) {
    throw new Error('Invalid connection string format for applying schema - must start with postgres:// or postgresql://');
  }


  if (!sqlContent.trim()) {
    console.warn('Schema file is empty. Nothing to apply.');
    return;
  }

  const client = new Client({ connectionString });

  try {
    console.log('Connecting to target database for applying schema...');
    await client.connect();
    console.log('Connected to target database.');

    console.log('Starting transaction...');
    await client.query('BEGIN');

    try {
      console.log('Executing schema SQL...');
      console.log("IMPORTANT: If this schema includes RLS policies for Supabase Storage ('storage.buckets', 'storage.objects'), ensure that the corresponding buckets have already been created in the target Supabase project (e.g., via Supabase Studio or client libraries) with matching names. This script does not create the buckets themselves.");
      await client.query(sqlContent);
      console.log('Schema SQL executed. Committing transaction...');
      await client.query('COMMIT');
      console.log('Schema applied successfully and transaction committed.');
    } catch (executionError) {
      console.error('Error executing schema SQL. Rolling back transaction...');
      await client.query('ROLLBACK');
      console.error('Transaction rolled back.', executionError);
      throw executionError;
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error applying schema:', err.message, err.stack);
    } else {
      console.error('Unknown error applying schema');
    }
    throw err;
  } finally {
    if (client && (client as any)._connected) {
      console.log('Closing target database connection.');
      await client.end();
    } else {
      console.log('Target client was not connected or already closed.');
    }
  }
}