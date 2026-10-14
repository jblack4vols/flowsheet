import { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import StatusBadge from './StatusBadge';
import VisitModal from './VisitModal';

export default function PatientDetail({ patient, visits = [], onAddVisit, onBack }) {
  const [showVisitModal, setShowVisitModal] = useState(false);

  if (!patient) return null;

  const patientVisits = visits.filter((v) => v.patient_id === patient.id);

  const handleSaveVisit = (visitData) => {
    onAddVisit(visitData);
    setShowVisitModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {patient.first_name} {patient.last_name}
          </h1>
          <p className="text-gray-600">ID: {patient.id}</p>
        </div>
      </div>

      {/* Patient Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 font-medium">Status</p>
          <div className="mt-2">
            <StatusBadge status={patient.status} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 font-medium">Date of Birth</p>
          <p className="text-lg font-semibold text-gray-900 mt-2">
            {patient.dob ? new Date(patient.dob).toLocaleDateString() : '-'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 font-medium">Therapist</p>
          <p className="text-lg font-semibold text-gray-900 mt-2">
            {patient.therapist || '-'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 font-medium">Clinic</p>
          <p className="text-lg font-semibold text-gray-900 mt-2">
            {patient.clinic}
          </p>
        </div>
      </div>

      {/* Log Visit Button */}
      <button
        onClick={() => setShowVisitModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:opacity-90 font-medium"
      >
        <Plus size={20} />
        Log Visit
      </button>

      {/* Visit History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Visit History</h2>
        {patientVisits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    BP
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    HR
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    Pain Level
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 hidden md:table-cell">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {patientVisits.map((visit) => (
                  <tr key={visit.visit_id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">
                      {new Date(visit.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{visit.bp}</td>
                    <td className="px-4 py-3 text-gray-900">{visit.hr}</td>
                    <td className="px-4 py-3 text-gray-900">{visit.pain_level}/10</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell max-w-xs truncate">
                      {visit.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No visit history</p>
        )}
      </div>

      {/* Visit Modal */}
      {showVisitModal && (
        <VisitModal
          patient={patient}
          onSave={handleSaveVisit}
          onClose={() => setShowVisitModal(false)}
        />
      )}
    </div>
  );
}
