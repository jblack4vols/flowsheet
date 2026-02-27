import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AuditLogViewer({ auditLog = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(auditLog.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedLog = auditLog.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-900">
                Timestamp
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">
                User
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">
                Action
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 hidden md:table-cell">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedLog.map((entry) => (
              <tr key={entry.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                  {new Date(entry.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-gray-900">
                  {entry.user_email}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {entry.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell max-w-xs truncate">
                  {entry.details || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedLog.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            No audit log entries
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
