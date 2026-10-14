import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BRAND } from '../constants';

export default function VisitModal({ patient, onSave, onClose }) {
  const { profile } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [bp, setBp] = useState('');
  const [hr, setHr] = useState('');
  const [painLevel, setPainLevel] = useState(5);
  const [exercises, setExercises] = useState(['']);
  const [notes, setNotes] = useState('');

  const handleAddExercise = () => {
    setExercises([...exercises, '']);
  };

  const handleRemoveExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index, value) => {
    const newExercises = [...exercises];
    newExercises[index] = value;
    setExercises(newExercises);
  };

  const handleSave = () => {
    if (!date || !bp || !hr) {
      alert('Please fill in all required fields');
      return;
    }

    const visitData = {
      patient_id: patient.id,
      date,
      therapist: profile?.full_name || 'Unknown',
      bp,
      hr: parseInt(hr),
      pain_level: parseInt(painLevel),
      exercises: exercises.filter((e) => e.trim()),
      notes,
    };

    onSave(visitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            Log Visit - {patient.first_name} {patient.last_name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Date, BP, HR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Blood Pressure
              </label>
              <input
                type="text"
                placeholder="e.g., 120/80"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Heart Rate
              </label>
              <input
                type="number"
                placeholder="bpm"
                value={hr}
                onChange={(e) => setHr(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
              />
            </div>
          </div>

          {/* Pain Level */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Pain Level: {painLevel}/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={painLevel}
              onChange={(e) => setPainLevel(e.target.value)}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${BRAND.orange} 0%, ${BRAND.orange} ${painLevel * 10}%, #e5e7eb ${painLevel * 10}%, #e5e7eb 100%)`,
              }}
            />
          </div>

          {/* Exercises */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-900">
                Exercises
              </label>
              <button
                onClick={handleAddExercise}
                className="flex items-center gap-1 text-sm text-brand-orange hover:text-orange-700 font-medium"
              >
                <Plus size={16} />
                Add Exercise
              </button>
            </div>
            <div className="space-y-2 flex flex-wrap gap-2">
              {exercises.map((exercise, index) => (
                <div key={index} className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Exercise name"
                    value={exercise}
                    onChange={(e) => handleExerciseChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  />
                  {exercises.length > 1 && (
                    <button
                      onClick={() => handleRemoveExercise(index)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about the visit..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90"
            style={{ backgroundColor: BRAND.orange }}
          >
            Save Visit
          </button>
        </div>
      </div>
    </div>
  );
}
