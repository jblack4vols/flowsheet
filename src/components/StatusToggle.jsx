import { BRAND } from '../constants';

export default function StatusToggle({ current, onChange }) {
  const statuses = ['Active', 'Inactive', 'DC'];

  return (
    <div className="flex gap-2">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => onChange(status)}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            current === status
              ? 'text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          style={{
            backgroundColor: current === status ? BRAND.orange : undefined,
          }}
        >
          {status}
        </button>
      ))}
    </div>
  );
}
