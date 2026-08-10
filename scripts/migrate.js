/* eslint-disable @typescript-eslint/no-require-imports */
const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

// Load DATABASE_URL from .env.local
const envContent = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
const match = envContent.match(/^DATABASE_URL=(.+)$/m);
if (!match) throw new Error("DATABASE_URL not found in .env.local");
const databaseUrl = match[1].trim();

const sql = neon(databaseUrl);

async function run() {
  console.log("Applying schema migrations to Neon...");

  // Create companies
  await sql`
    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      symbol VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      isin VARCHAR(20) NOT NULL,
      sector VARCHAR(100),
      industry VARCHAR(100),
      description TEXT,
      website VARCHAR(255),
      logo_url VARCHAR(512),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_companies_symbol ON companies(symbol)`;

  // Create financial_periods
  await sql`
    CREATE TABLE IF NOT EXISTS financial_periods (
      id SERIAL PRIMARY KEY,
      company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('QUARTERLY', 'ANNUAL')),
      period VARCHAR(20) NOT NULL,
      sales NUMERIC,
      expenses NUMERIC,
      operating_profit NUMERIC,
      opm_percent NUMERIC,
      other_income NUMERIC,
      interest NUMERIC,
      depreciation NUMERIC,
      profit_before_tax NUMERIC,
      tax_percent NUMERIC,
      net_profit NUMERIC,
      eps NUMERIC,
      source VARCHAR(50) NOT NULL,
      retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_financial_periods UNIQUE (company_id, type, period)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_financial_periods_lookup ON financial_periods(company_id, type)`;

  // Create balance_sheets
  await sql`
    CREATE TABLE IF NOT EXISTS balance_sheets (
      id SERIAL PRIMARY KEY,
      company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
      period VARCHAR(20) NOT NULL,
      equity_capital NUMERIC,
      reserves NUMERIC,
      borrowings NUMERIC,
      other_liabilities NUMERIC,
      total_liabilities NUMERIC,
      fixed_assets NUMERIC,
      cwip NUMERIC,
      investments NUMERIC,
      other_assets NUMERIC,
      total_assets NUMERIC,
      source VARCHAR(50) NOT NULL,
      retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_balance_sheets UNIQUE (company_id, period)
    )
  `;

  // Create cash_flows
  await sql`
    CREATE TABLE IF NOT EXISTS cash_flows (
      id SERIAL PRIMARY KEY,
      company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
      period VARCHAR(20) NOT NULL,
      operating_cash_flow NUMERIC,
      investing_cash_flow NUMERIC,
      financing_cash_flow NUMERIC,
      net_cash_flow NUMERIC,
      source VARCHAR(50) NOT NULL,
      retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_cash_flows UNIQUE (company_id, period)
    )
  `;

  // Create ipos
  await sql`
    CREATE TABLE IF NOT EXISTS ipos (
      id SERIAL PRIMARY KEY,
      symbol VARCHAR(20),
      name VARCHAR(255) NOT NULL,
      category VARCHAR(20) NOT NULL CHECK (
        category IN ('upcoming', 'listed', 'active', 'closed', 'pre_apply')
      ),
      is_sme BOOLEAN NOT NULL DEFAULT false,
      status VARCHAR(100),
      additional_text TEXT,
      min_price NUMERIC,
      max_price NUMERIC,
      issue_price NUMERIC,
      listing_gains NUMERIC,
      listing_price NUMERIC,
      bidding_start_date VARCHAR(50),
      bidding_end_date VARCHAR(50),
      listing_date VARCHAR(50),
      allotment_date VARCHAR(50),
      lot_size INTEGER,
      min_bid_quantity INTEGER,
      total_subscription_rate NUMERIC,
      document_url TEXT,
      retrieved_at TIMESTAMP WITH TIME ZONE NOT NULL
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_ipos_retrieved ON ipos(retrieved_at)`;
  
  // Cache alterations for Phase 10.3 stock details
  console.log("Adding dynamic cache columns to companies table...");
  await sql`
    ALTER TABLE companies 
    ADD COLUMN IF NOT EXISTS peers_data JSONB,
    ADD COLUMN IF NOT EXISTS peers_retrieved_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS shareholding_data JSONB,
    ADD COLUMN IF NOT EXISTS shareholding_retrieved_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS corporate_actions JSONB,
    ADD COLUMN IF NOT EXISTS announcements JSONB,
    ADD COLUMN IF NOT EXISTS documents_retrieved_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS ratios_data JSONB,
    ADD COLUMN IF NOT EXISTS ratios_retrieved_at TIMESTAMP WITH TIME ZONE;
  `;

  console.log("Migrations applied successfully.");
}

run().catch(console.error);
