import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PatientsList from './PatientsList';

const mockPatients = [
  { id: 'uuid-1', first_name: 'John', last_name: 'Smith', status: 'Active', dob: '1990-01-01', therapist: 'Dr. Carter', last_visit: '2026-10-01', clinic: 'Morristown' },
  { id: 'uuid-2', first_name: 'Jane', last_name: 'Doe', status: 'Active', dob: '1985-05-15', therapist: 'Dr. Reeves', last_visit: '2026-10-10', clinic: 'Newport' },
  { id: 'uuid-3', first_name: 'Bob', last_name: 'Jones', status: 'Inactive', dob: '1970-03-20', therapist: 'Dr. Kim', last_visit: '2026-09-01', clinic: 'Morristown' },
  { id: 'uuid-4', first_name: 'Alice', last_name: 'Brown', status: 'DC', dob: '1960-12-05', therapist: 'Dr. Patel', last_visit: '2026-08-15', clinic: 'Maryville' },
];

describe('PatientsList', () => {
  it('renders active patients by default', () => {
    render(<PatientsList patients={mockPatients} onSelect={vi.fn()} onStatusChange={vi.fn()} />);

    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument();
    expect(screen.queryByText('Alice Brown')).not.toBeInTheDocument();
  });

  it('filters by status when tab is clicked', () => {
    render(<PatientsList patients={mockPatients} onSelect={vi.fn()} onStatusChange={vi.fn()} />);

    fireEvent.click(screen.getByText('Inactive'));
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
  });

  it('filters by search term (first name)', () => {
    render(<PatientsList patients={mockPatients} onSelect={vi.fn()} onStatusChange={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search by name or ID...');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
  });

  it('filters by search term (last name, case-insensitive)', () => {
    render(<PatientsList patients={mockPatients} onSelect={vi.fn()} onStatusChange={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search by name or ID...');
    fireEvent.change(searchInput, { target: { value: 'smith' } });

    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
  });

  it('searches by patient ID', () => {
    render(<PatientsList patients={mockPatients} onSelect={vi.fn()} onStatusChange={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search by name or ID...');
    fireEvent.change(searchInput, { target: { value: 'uuid-1' } });

    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
  });

  it('shows empty state when no patients match', () => {
    render(<PatientsList patients={mockPatients} onSelect={vi.fn()} onStatusChange={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText('Search by name or ID...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No patients found')).toBeInTheDocument();
  });

  it('calls onSelect when View button is clicked', () => {
    const onSelect = vi.fn();
    render(<PatientsList patients={mockPatients} onSelect={onSelect} onStatusChange={vi.fn()} />);

    fireEvent.click(screen.getAllByText('View')[0]);
    expect(onSelect).toHaveBeenCalledWith(mockPatients[0]);
  });

  it('displays patient ID using id field (not patient_id)', () => {
    render(<PatientsList patients={mockPatients} onSelect={vi.fn()} onStatusChange={vi.fn()} />);

    expect(screen.getByText('ID: uuid-1')).toBeInTheDocument();
    expect(screen.getByText('ID: uuid-2')).toBeInTheDocument();
  });

  it('renders with empty patients array', () => {
    render(<PatientsList patients={[]} onSelect={vi.fn()} onStatusChange={vi.fn()} />);

    expect(screen.getByText('No patients found')).toBeInTheDocument();
  });
});
