import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    selectedClinic: 'All Clinics',
  }),
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="chart-container">{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Cell: () => <div />,
}));

const mockPatients = [
  { id: 'p1', first_name: 'John', last_name: 'Smith', status: 'Active', clinic: 'Morristown' },
  { id: 'p2', first_name: 'Jane', last_name: 'Doe', status: 'Active', clinic: 'Newport' },
  { id: 'p3', first_name: 'Bob', last_name: 'Jones', status: 'Inactive', clinic: 'Morristown' },
  { id: 'p4', first_name: 'Alice', last_name: 'Brown', status: 'DC', clinic: 'Maryville' },
];

const today = new Date().toISOString().split('T')[0];

const mockVisits = [
  { visit_id: 'v1', patient_id: 'p1', date: today, bp: '120/80', hr: 72 },
  { visit_id: 'v2', patient_id: 'p2', date: today, bp: '130/85', hr: 80 },
  { visit_id: 'v3', patient_id: 'p3', date: '2024-01-01', bp: '110/70', hr: 65 },
];

function getStatValue(label) {
  const labelEl = screen.getByText(label);
  const card = labelEl.closest('div');
  return card.querySelector('.text-2xl').textContent;
}

describe('Dashboard', () => {
  it('renders stat cards with correct totals', () => {
    render(<Dashboard patients={mockPatients} visits={mockVisits} />);

    expect(screen.getByText('Total Patients')).toBeInTheDocument();
    expect(getStatValue('Total Patients')).toBe('4');
  });

  it('shows correct active patient count', () => {
    render(<Dashboard patients={mockPatients} visits={mockVisits} />);

    expect(getStatValue('Active')).toBe('2');
  });

  it('shows correct discharged count', () => {
    render(<Dashboard patients={mockPatients} visits={mockVisits} />);

    expect(getStatValue('Discharged')).toBe('1');
  });

  it('counts visits today correctly', () => {
    render(<Dashboard patients={mockPatients} visits={mockVisits} />);

    expect(getStatValue('Visits Today')).toBe('2');
  });

  it('renders recent activity with patient names', () => {
    render(<Dashboard patients={mockPatients} visits={mockVisits} />);

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('shows visit BP and HR in recent activity', () => {
    render(<Dashboard patients={mockPatients} visits={mockVisits} />);

    expect(screen.getByText('BP: 120/80')).toBeInTheDocument();
    expect(screen.getByText('HR: 72')).toBeInTheDocument();
  });

  it('shows "No recent activity" when visits is empty', () => {
    render(<Dashboard patients={mockPatients} visits={[]} />);

    expect(screen.getByText('No recent activity')).toBeInTheDocument();
  });

  it('renders chart when All Clinics is selected', () => {
    render(<Dashboard patients={mockPatients} visits={mockVisits} />);

    expect(screen.getByText('Patients by Clinic')).toBeInTheDocument();
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });

  it('uses patient.id (not patient_id) for join lookups', () => {
    const patients = [{ id: 'correct-id', first_name: 'Test', last_name: 'User', status: 'Active', clinic: 'Morristown' }];
    const visits = [{ visit_id: 'v1', patient_id: 'correct-id', date: today, bp: '120/80', hr: 72 }];

    render(<Dashboard patients={patients} visits={visits} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('defaults to empty arrays when no props provided', () => {
    render(<Dashboard />);

    expect(getStatValue('Total Patients')).toBe('0');
    expect(screen.getByText('No recent activity')).toBeInTheDocument();
  });

  it('limits recent activity to 5 visits', () => {
    const manyVisits = Array.from({ length: 8 }, (_, i) => ({
      visit_id: `v${i}`,
      patient_id: 'p1',
      date: today,
      bp: '120/80',
      hr: 72,
    }));

    render(<Dashboard patients={mockPatients} visits={manyVisits} />);

    const bpElements = screen.getAllByText('BP: 120/80');
    expect(bpElements.length).toBe(5);
  });
});
