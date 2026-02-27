import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function PatientsList({ patients = [], onSelect, onStatusChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter patients
  const filtered = patients.filter((p) => {
    const matchesSearch =
      p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patient_id.toString().includes(searchTerm);
    const matchesStatus = p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filtered.slice(
    startIdx,
    startIdx + itemsPerPage
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['Active', 'Inactive', 'DC'].map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              statusFilter === status
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-900">
                Name
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 hidden md:table-cell">
                DOB
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 hidden md:table-cell">
                Therapist
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 hidden md:table-cell">
                Last Visit
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-900">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedPatients.map((patient) => (
              <tr key={patient.patient_id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {patient.first_name} {patient.last_name}
                    </p>
                    <p className="text-xs text-gray-600">
                      ID: {patient.patient_id}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                  {patient.dob ? new Date(patient.dob).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                  {patient.therapist || '-'}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                  {patient.last_visit
                    ? new Date(patient.last_visit).toLocaleDateString()
                    : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onSelect(patient)}
                    className="text-brand-orange hover:text-orange-700 font-medium"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedPatients.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            No patients found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-50"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
