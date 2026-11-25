-- ==============================================================================
-- FlowDesk Database Schema (PostgreSQL / Supabase)
-- ==============================================================================

-- 1. Create Invoices Table
create table if not exists public.invoices (
  id text primary key,
  invoice_number text not null unique,
  client_name text not null,
  client_email text not null,
  issue_date date not null default current_date,
  due_date date not null,
  status text not null check (status in ('PAID', 'PENDING', 'OVERDUE', 'DRAFT')),
  subtotal numeric not null default 0,
  tax_rate numeric not null default 11,
  tax_amount numeric not null default 0,
  total numeric not null default 0,
  currency text not null default 'IDR',
  notes text,
  items jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Indexes for High-Performance Queries
create index if not exists idx_invoices_status on public.invoices(status);
create index if not exists idx_invoices_due_date on public.invoices(due_date);
create index if not exists idx_invoices_created_at on public.invoices(created_at desc);

-- 3. Row Level Security (RLS) Configuration
alter table public.invoices enable row level security;

-- Demo policy: Allow read and write for the portfolio showcase
create policy "Allow public read-write for showcase demo"
  on public.invoices
  for all
  using (true)
  with check (true);

-- 4. Initial Seed Data (Realistic B2B Portfolio Data in IDR)
insert into public.invoices (id, invoice_number, client_name, client_email, issue_date, due_date, status, subtotal, tax_rate, tax_amount, total, currency, notes, items)
values
  (
    'inv-001',
    'INV-2026-001',
    'Acme Cybernetics Inc',
    'finance@acme.example',
    '2026-11-10',
    '2026-12-10',
    'PAID',
    63000000,
    11,
    6930000,
    69930000,
    'IDR',
    'Pembayaran diterima via transfer BCA Instant.',
    '[{"id":"item-1","description":"Cloud Infrastructure Migration & Terraform Orchestration","quantity":1,"rate":45000000,"amount":45000000},{"id":"item-2","description":"PostgreSQL Query Optimization & High-Availability Audit","quantity":8,"rate":2250000,"amount":18000000}]'::jsonb
  ),
  (
    'inv-002',
    'INV-2026-002',
    'Hyperion Digital Agency',
    'ops@hyperion.digital',
    '2026-11-15',
    '2026-11-30',
    'PENDING',
    112500000,
    11,
    12375000,
    124875000,
    'IDR',
    'Jatuh tempo Net 15. Instruksi transfer bank terlampir.',
    '[{"id":"item-3","description":"Custom Next.js 15 Design System & Micro-Interactions","quantity":1,"rate":82500000,"amount":82500000},{"id":"item-4","description":"Interactive 3D WebGL Hero Canvas Implementation","quantity":1,"rate":30000000,"amount":30000000}]'::jsonb
  ),
  (
    'inv-003',
    'INV-2026-003',
    'Kinetix BioTech Solutions',
    'billing@kinetixbio.org',
    '2026-10-01',
    '2026-10-31',
    'OVERDUE',
    46500000,
    11,
    5115000,
    51615000,
    'IDR',
    'Pengingat kedua dikirim 15 November.',
    '[{"id":"item-5","description":"Laboratory Telemetry Dashboard API & Event Gateway","quantity":1,"rate":46500000,"amount":46500000}]'::jsonb
  ),
  (
    'inv-004',
    'INV-2026-004',
    'Luminary AI Studio',
    'founder@luminaryai.tech',
    '2026-11-22',
    '2026-12-22',
    'DRAFT',
    144000000,
    11,
    15840000,
    159840000,
    'IDR',
    'Draf menunggu penandatanganan SOW final.',
    '[{"id":"item-6","description":"Vector Database Embedding Pipeline & LLM RAG Tuning","quantity":1,"rate":120000000,"amount":120000000},{"id":"item-7","description":"Automated Evaluation Benchmark Suite","quantity":1,"rate":24000000,"amount":24000000}]'::jsonb
  ),
  (
    'inv-005',
    'INV-2026-005',
    'Vanguard Retail Partners',
    'ap@vanguardretail.com',
    '2026-11-05',
    '2026-11-20',
    'PAID',
    186000000,
    11,
    20460000,
    206460000,
    'IDR',
    'Retainer tahunan - pelunasan Q4.',
    '[{"id":"item-8","description":"Full-Stack E-commerce Performance Optimization","quantity":1,"rate":141000000,"amount":141000000},{"id":"item-9","description":"Dedicated SLA Incident Response (November)","quantity":1,"rate":45000000,"amount":45000000}]'::jsonb
  )
on conflict (invoice_number) do nothing;
