import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Database helpers ──────────────────────────────────────────────

export async function fetchPatients(clinic = null) {
  let query = supabase.from('patients').select('*').order('last_name');
  if (clinic && clinic !== 'All Clinics') {
    query = query.eq('clinic', clinic);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updatePatientStatus(id, status) {
  const { error } = await supabase
    .from('patients')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function fetchVisits(patientId = null) {
  let query = supabase.from('visits').select('*').order('date', { ascending: false });
  if (patientId) {
    query = query.eq('patient_id', patientId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function insertVisit(visit) {
  const { data, error } = await supabase.from('visits').insert(visit).select().single();
  if (error) throw error;
  return data;
}

export async function insertPatient(patient) {
  const { data, error } = await supabase.from('patients').insert(patient).select().single();
  if (error) throw error;
  return data;
}

export async function fetchAuditLog() {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return data;
}

export async function insertAuditEntry(userId, userEmail, action, details) {
  const { error } = await supabase.from('audit_log').insert({
    user_id: userId,
    user_email: userEmail,
    action,
    details,
  });
  if (error) throw error;
}

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, updates) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) throw error;
}

export async function fetchClinics() {
  const { data, error } = await supabase
    .from('clinics')
    .select('name')
    .eq('active', true)
    .order('name');
  if (error) throw error;
  return data.map((c) => c.name);
}
