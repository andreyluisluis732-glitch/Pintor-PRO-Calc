import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Database, Table, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SupabaseTestPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const [showSql, setShowSql] = useState(false);

  const migrationSql = `-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  display_name text,
  role text check (role in ('user', 'admin')) default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create estimates table
create table public.estimates (
  id uuid default gen_random_uuid() primary key,
  uid uuid references auth.users on delete cascade not null,
  title text not null,
  client_name text,
  client_phone text,
  property_type text,
  city text,
  neighborhood text,
  location text,
  include_paint boolean default true,
  area numeric not null,
  product_id text,
  color text,
  coats integer default 2,
  price_per_m2 numeric,
  total_liters numeric,
  package_size text,
  package_count integer,
  material_cost numeric,
  labor_cost numeric,
  total_cost numeric not null,
  date text,
  status text default 'Aguardando',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create appointments table
create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  uid uuid references auth.users on delete cascade not null,
  client_name text not null,
  client_phone text,
  client_email text,
  client_address text,
  notes text,
  date text not null,
  time text not null,
  status text default 'Pendente',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.estimates enable row level security;
alter table public.appointments enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Estimates policies
create policy "Users can view their own estimates." on public.estimates
  for select using (auth.uid() = uid);

create policy "Users can insert their own estimates." on public.estimates
  for insert with check (auth.uid() = uid);

create policy "Users can update their own estimates." on public.estimates
  for update using (auth.uid() = uid);

create policy "Users can delete their own estimates." on public.estimates
  for delete using (auth.uid() = uid);

-- Appointments policies
create policy "Users can view their own appointments." on public.appointments
  for select using (auth.uid() = uid);

create policy "Users can insert their own appointments." on public.appointments
  for insert with check (auth.uid() = uid);

create policy "Users can update their own appointments." on public.appointments
  for update using (auth.uid() = uid);

create policy "Users can delete their own appointments." on public.appointments
  for delete using (auth.uid() = uid);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();`;

  const testConnection = async () => {
    if (!supabase) {
      setStatus('error');
      setMessage('Supabase não está configurado. Por favor, adicione as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no painel de Segredos.');
      return;
    }
    setStatus('loading');
    try {
      // Just a simple query to test connection
      const { error } = await supabase.from('profiles').select('*').limit(1);
      
      if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
        throw error;
      }
      
      setStatus('success');
      setMessage('Conexão com Supabase estabelecida com sucesso!');
    } catch (err: unknown) {
      console.error('Supabase connection error:', err);
      setStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setMessage(`Erro ao conectar: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface p-6 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-surface-container rounded-3xl p-8 shadow-xl border border-outline-variant/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Database size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Supabase Test & Setup</h1>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Integração de Banco de Dados</p>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            O Supabase foi configurado com sucesso. Use este painel para testar a conexão e obter o SQL de migração para configurar suas tabelas.
          </p>

          <div className={`p-4 rounded-2xl flex items-start gap-3 transition-all ${
            status === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
            status === 'error' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
            'bg-surface-container-highest text-on-surface-variant border border-outline-variant/10'
          }`}>
            {status === 'success' ? <CheckCircle2 className="shrink-0 mt-0.5" size={18} /> : 
             status === 'error' ? <AlertCircle className="shrink-0 mt-0.5" size={18} /> : 
             <Table className="shrink-0 mt-0.5" size={18} />}
            
            <div>
              <p className="text-xs font-black uppercase tracking-tighter mb-1">Status da Conexão</p>
              <p className="text-sm font-medium">
                {status === 'idle' ? 'Aguardando teste...' : 
                 status === 'loading' ? 'Testando conexão...' : 
                 message}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={testConnection}
              disabled={status === 'loading'}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              Testar Conexão
            </button>
            
            <button
              onClick={() => setShowSql(!showSql)}
              className="w-full bg-secondary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {showSql ? 'Ocultar SQL' : 'Ver SQL de Migração'}
            </button>
          </div>

          {showSql && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-surface-container-highest rounded-2xl border border-outline-variant/10">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Instruções:</p>
                <ol className="text-xs text-on-surface-variant space-y-2 list-decimal ml-4">
                  <li>Acesse o seu projeto no <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary underline">Dashboard do Supabase</a>.</li>
                  <li>Vá em <strong>SQL Editor</strong> no menu lateral.</li>
                  <li>Clique em <strong>New Query</strong>.</li>
                  <li>Cole o código SQL abaixo e clique em <strong>Run</strong>.</li>
                </ol>
              </div>
              
              <div className="relative">
                <pre className="bg-black text-green-400 p-4 rounded-2xl text-[10px] overflow-x-auto max-h-96 border border-white/10 font-mono">
                  {migrationSql}
                </pre>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(migrationSql);
                  }}
                  className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  Copiar
                </button>
              </div>
            </div>
          )}

          <Link
            to="/"
            className="block w-full bg-surface-container-highest text-on-surface py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-center border border-outline-variant/10 hover:bg-surface-container-high transition-all"
          >
            Voltar para o Início
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-outline-variant/10">
          <p className="text-[10px] text-center text-on-surface-variant font-bold uppercase tracking-widest">
            Configurado em <code className="bg-surface-container-highest px-1 rounded">lib/supabase.ts</code>
          </p>
        </div>
      </div>
    </div>
  );
}
