import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockSingle = vi.fn();

function createChain(finalResult = { data: [], error: null }) {
  const chain = {
    select: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve(finalResult)),
  };
  chain.then = (resolve) => resolve(finalResult);
  return chain;
}

let mockChain;

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: vi.fn(() => mockChain),
  }),
}));

let supabaseModule;

beforeEach(async () => {
  vi.resetModules();
  mockChain = createChain();
  supabaseModule = await import('./supabase.js');
});

describe('fetchPatients', () => {
  it('returns patient data ordered by last_name', async () => {
    const patients = [{ id: '1', last_name: 'Smith' }];
    mockChain = createChain({ data: patients, error: null });

    const result = await supabaseModule.fetchPatients();
    expect(result).toEqual(patients);
  });

  it('throws on error', async () => {
    mockChain = createChain({ data: null, error: new Error('DB error') });

    await expect(supabaseModule.fetchPatients()).rejects.toThrow('DB error');
  });

  it('applies clinic filter when not "All Clinics"', async () => {
    const patients = [{ id: '1', clinic: 'Morristown' }];
    mockChain = createChain({ data: patients, error: null });

    const result = await supabaseModule.fetchPatients('Morristown');
    expect(mockChain.eq).toHaveBeenCalledWith('clinic', 'Morristown');
    expect(result).toEqual(patients);
  });

  it('skips clinic filter for "All Clinics"', async () => {
    mockChain = createChain({ data: [], error: null });

    await supabaseModule.fetchPatients('All Clinics');
    expect(mockChain.eq).not.toHaveBeenCalled();
  });
});

describe('updatePatientStatus', () => {
  it('updates status and updated_at', async () => {
    mockChain = createChain({ data: null, error: null });

    await supabaseModule.updatePatientStatus('uuid-123', 'Inactive');
    expect(mockChain.update).toHaveBeenCalled();
    const updateArg = mockChain.update.mock.calls[0][0];
    expect(updateArg.status).toBe('Inactive');
    expect(updateArg.updated_at).toBeDefined();
    expect(mockChain.eq).toHaveBeenCalledWith('id', 'uuid-123');
  });

  it('throws on error', async () => {
    mockChain = createChain({ data: null, error: new Error('Update failed') });

    await expect(
      supabaseModule.updatePatientStatus('uuid-123', 'Active')
    ).rejects.toThrow('Update failed');
  });
});

describe('insertAuditEntry', () => {
  it('inserts audit record', async () => {
    mockChain = createChain({ data: null, error: null });

    await supabaseModule.insertAuditEntry('uid', 'user@test.com', 'LOGIN', 'details');
    expect(mockChain.insert).toHaveBeenCalledWith({
      user_id: 'uid',
      user_email: 'user@test.com',
      action: 'LOGIN',
      details: 'details',
    });
  });

  it('throws on error', async () => {
    mockChain = createChain({ data: null, error: new Error('Audit failed') });

    await expect(
      supabaseModule.insertAuditEntry('uid', 'user@test.com', 'LOGIN', 'details')
    ).rejects.toThrow('Audit failed');
  });
});

describe('fetchClinics', () => {
  it('returns array of clinic names', async () => {
    mockChain = createChain({
      data: [{ name: 'Morristown' }, { name: 'Newport' }],
      error: null,
    });

    const result = await supabaseModule.fetchClinics();
    expect(result).toEqual(['Morristown', 'Newport']);
  });

  it('handles empty array', async () => {
    mockChain = createChain({ data: [], error: null });

    const result = await supabaseModule.fetchClinics();
    expect(result).toEqual([]);
  });
});

describe('insertVisit', () => {
  it('returns the inserted visit', async () => {
    const visit = { patient_id: 'p1', date: '2026-10-14', bp: '120/80', hr: 72 };
    mockChain = createChain({ data: visit, error: null });
    // Override single to return the visit
    mockChain.single = vi.fn(() => Promise.resolve({ data: visit, error: null }));
    mockChain.select = vi.fn(() => mockChain);
    mockChain.insert = vi.fn(() => mockChain);

    // Re-import to pick up new mock
    vi.resetModules();
    const mod = await import('./supabase.js');
    // The chain mock is already set up globally
    const result = await mod.insertVisit(visit);
    expect(result).toEqual(visit);
  });
});
