import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VisitModal from './VisitModal';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    profile: { full_name: 'Dr. Carter', role: 'Therapist' },
  }),
}));

const mockPatient = {
  id: 'uuid-1',
  first_name: 'John',
  last_name: 'Smith',
};

describe('VisitModal', () => {
  let onSave, onClose;

  beforeEach(() => {
    onSave = vi.fn();
    onClose = vi.fn();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('renders patient name in header', () => {
    render(<VisitModal patient={mockPatient} onSave={onSave} onClose={onClose} />);
    expect(screen.getByText('Log Visit - John Smith')).toBeInTheDocument();
  });

  it('alerts when required fields are empty', () => {
    render(<VisitModal patient={mockPatient} onSave={onSave} onClose={onClose} />);

    fireEvent.click(screen.getByText('Save Visit'));
    expect(window.alert).toHaveBeenCalledWith('Please fill in all required fields');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onSave with correct data when form is filled', () => {
    render(<VisitModal patient={mockPatient} onSave={onSave} onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText('e.g., 120/80'), {
      target: { value: '130/85' },
    });
    fireEvent.change(screen.getByPlaceholderText('bpm'), {
      target: { value: '72' },
    });

    fireEvent.click(screen.getByText('Save Visit'));

    expect(onSave).toHaveBeenCalledTimes(1);
    const visitData = onSave.mock.calls[0][0];
    expect(visitData.patient_id).toBe('uuid-1');
    expect(visitData.bp).toBe('130/85');
    expect(visitData.hr).toBe(72);
    expect(visitData.therapist).toBe('Dr. Carter');
  });

  it('uses patient.id (not patient_id) for visit FK', () => {
    render(<VisitModal patient={mockPatient} onSave={onSave} onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText('e.g., 120/80'), {
      target: { value: '120/80' },
    });
    fireEvent.change(screen.getByPlaceholderText('bpm'), {
      target: { value: '80' },
    });

    fireEvent.click(screen.getByText('Save Visit'));

    const visitData = onSave.mock.calls[0][0];
    expect(visitData.patient_id).toBe('uuid-1');
  });

  it('parses hr as integer', () => {
    render(<VisitModal patient={mockPatient} onSave={onSave} onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText('e.g., 120/80'), {
      target: { value: '120/80' },
    });
    fireEvent.change(screen.getByPlaceholderText('bpm'), {
      target: { value: '72' },
    });

    fireEvent.click(screen.getByText('Save Visit'));

    const visitData = onSave.mock.calls[0][0];
    expect(typeof visitData.hr).toBe('number');
    expect(visitData.hr).toBe(72);
  });

  it('filters out empty exercises', () => {
    render(<VisitModal patient={mockPatient} onSave={onSave} onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText('e.g., 120/80'), {
      target: { value: '120/80' },
    });
    fireEvent.change(screen.getByPlaceholderText('bpm'), {
      target: { value: '72' },
    });

    const exerciseInput = screen.getByPlaceholderText('Exercise name');
    fireEvent.change(exerciseInput, { target: { value: '  ' } });

    fireEvent.click(screen.getByText('Save Visit'));

    const visitData = onSave.mock.calls[0][0];
    expect(visitData.exercises).toEqual([]);
  });

  it('calls onClose when Cancel is clicked', () => {
    render(<VisitModal patient={mockPatient} onSave={onSave} onClose={onClose} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('falls back to "Unknown" therapist when profile name missing', async () => {
    vi.resetModules();

    vi.doMock('../contexts/AuthContext', () => ({
      useAuth: () => ({
        profile: null,
      }),
    }));

    const { default: VisitModalNoProfile } = await import('./VisitModal');
    render(<VisitModalNoProfile patient={mockPatient} onSave={onSave} onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText('e.g., 120/80'), {
      target: { value: '120/80' },
    });
    fireEvent.change(screen.getByPlaceholderText('bpm'), {
      target: { value: '72' },
    });

    fireEvent.click(screen.getByText('Save Visit'));

    const visitData = onSave.mock.calls[0][0];
    expect(visitData.therapist).toBe('Unknown');
  });
});
