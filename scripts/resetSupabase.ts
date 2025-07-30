import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';
import dotenv from 'dotenv';
import { parse } from 'pg-connection-string';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

async function run() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    console.error('SUPABASE_DB_URL environment variable is not set.');
    console.error('Please add your Supabase database connection string to the .env file.');
    console.error('You can find this in your Supabase project settings under Database > Connection string > URI');
    process.exit(1);
  }

  // Parse the connection string to get individual components
  const config = parse(dbUrl);
  
  const client = new Client({
    host: config.host,
    port: config.port ? parseInt(config.port) : 5432,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  console.log('Connected to Supabase database successfully!');

  try {
    console.log('Resetting public schema...');
    await client.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
    console.log('Public schema reset complete.');

    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.error(`Migrations directory not found: ${migrationsDir}`);
      process.exit(1);
    }
    
    const files = fs.readdirSync(migrationsDir).sort();
    
    if (files.length === 0) {
      console.log('No migration files found.');
      return;
    }
    
    console.log(`Found ${files.length} migration files:`);
    files.forEach(file => console.log(`  - ${file}`));

    for (const file of files) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        console.log(`Running migration: ${file}`);
        try {
          await client.query(sql);
          console.log(`✓ ${file} completed successfully`);
        } catch (error) {
          console.error(`✗ Error in ${file}:`, error);
          throw error;
        }
      }
    }

    console.log('\n🎉 All migrations applied successfully!');
    console.log('Your Supabase database is now ready to use.');
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('\n❌ Failed to run migrations:', err.message);
  console.error('\nTroubleshooting tips:');
  console.error('1. Make sure your SUPABASE_DB_URL is correct in the .env file');
  console.error('2. Ensure your Supabase project is active and accessible');
  console.error('3. Check that the connection string includes the correct password');
  process.exit(1);
});