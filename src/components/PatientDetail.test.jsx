import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PatientDetail from './PatientDetail';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    profile: { full_name: 'Dr. Carter', role: 'Therapist' },
  }),
}));

const mockPatient = {
  id: 'uuid-1',
  first_name: 'John',
  last_name: 'Smith',
  dob: '1990-01-15',
  status: 'Active',
  therapist: 'Dr. Carter',
  clinic: 'Morristown',
  last_visit: '2026-10-01',
};

const mockVisits = [
  { visit_id: 'v1', patient_id: 'uuid-1', date: '2026-10-01', bp: '120/80', hr: 72, pain_level: 5, notes: 'Good progress', therapist: 'Dr. Carter', exercises: [] },
  { visit_id: 'v2', patient_id: 'uuid-1', date: '2026-09-25', bp: '130/85', hr: 80, pain_level: 6, notes: '', therapist: 'Dr. Carter', exercises: [] },
  { visit_id: 'v3', patient_id: 'uuid-2', date: '2026-10-01', bp: '110/70', hr: 65, pain_level: 3, notes: '', therapist: 'Dr. Kim', exercises: [] },
];

describe('PatientDetail', () => {
  it('renders patient name', () => {
    render(
      <PatientDetail
        patient={mockPatient}
        visits={mockVisits}
        onAddVisit={vi.fn()}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByText('John Smith')).toBeInTheDocument();
  });

  it('shows patient ID', () => {
    render(
      <PatientDetail
        patient={mockPatient}
        visits={mockVisits}
        onAddVisit={vi.fn()}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByText('ID: uuid-1')).toBeInTheDocument();
  });

  it('filters visits by patient.id (not patient_id on patient)', () => {
    render(
      <PatientDetail
        patient={mockPatient}
        visits={mockVisits}
        onAddVisit={vi.fn()}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByText('120/80')).toBeInTheDocument();
    expect(screen.getByText('130/85')).toBeInTheDocument();
    expect(screen.queryByText('110/70')).not.toBeInTheDocument();
  });

  it('renders patient clinic', () => {
    render(
      <PatientDetail
        patient={mockPatient}
        visits={mockVisits}
        onAddVisit={vi.fn()}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByText('Morristown')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    const onBack = vi.fn();
    render(
      <PatientDetail
        patient={mockPatient}
        visits={mockVisits}
        onAddVisit={vi.fn()}
        onBack={onBack}
      />
    );

    const backButton = screen.getByRole('button', { name: '' });
    fireEvent.click(backButton);
    expect(onBack).toHaveBeenCalled();
  });

  it('opens visit modal when Log Visit is clicked', () => {
    render(
      <PatientDetail
        patient={mockPatient}
        visits={mockVisits}
        onAddVisit={vi.fn()}
        onBack={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Log Visit'));
    expect(screen.getByText('Log Visit - John Smith')).toBeInTheDocument();
  });

  it('shows empty state when no visits for this patient', () => {
    render(
      <PatientDetail
        patient={mockPatient}
        visits={[]}
        onAddVisit={vi.fn()}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByText('No visit history')).toBeInTheDocument();
  });

  it('displays visit data in table', () => {
    render(
      <PatientDetail
        patient={mockPatient}
        visits={mockVisits}
        onAddVisit={vi.fn()}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByText('120/80')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText('5/10')).toBeInTheDocument();
  });

  it('returns null when no patient provided', () => {
    const { container } = render(
      <PatientDetail
        patient={null}
        visits={mockVisits}
        onAddVisit={vi.fn()}
        onBack={vi.fn()}
      />
    );

    expect(container.innerHTML).toBe('');
  });
});
