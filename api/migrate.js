const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL || '';
const isLocal = !dbUrl || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

const poolConfig = {
    connectionString: dbUrl,
    connectionTimeoutMillis: 10000,
};

if (!isLocal) {
    poolConfig.ssl = { rejectUnauthorized: false };
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const pool = new Pool(poolConfig);

async function migrate() {
    console.log('🚀 Starting database migrations...');

    try {
        // 1. Create migrations table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Read migration files
        const migrationsDir = path.join(__dirname, '../migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        // 3. Get already executed migrations
        const { rows } = await pool.query('SELECT name FROM schema_migrations');
        const executedMigrations = new Set(rows.map(r => r.name));

        // 4. Run missing migrations
        for (const file of files) {
            if (!executedMigrations.has(file)) {
                console.log(`📜 Executing migration: ${file}`);
                const filePath = path.join(migrationsDir, file);
                const sql = fs.readFileSync(filePath, 'utf8');

                await pool.query('BEGIN');
                try {
                    await pool.query(sql);
                    await pool.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
                    await pool.query('COMMIT');
                    console.log(`✅ ${file} completed.`);
                } catch (err) {
                    await pool.query('ROLLBACK');
                    console.error(`❌ Error in ${file}:`, err.message);
                    process.exit(1);
                }
            } else {
                console.log(`⏭️ Skipping ${file} (already executed).`);
            }
        }

        console.log('🎉 All migrations completed successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
