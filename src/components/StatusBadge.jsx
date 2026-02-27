export default function StatusBadge({ status }) {
  const statusConfig = {
    Active: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Active',
    },
    Inactive: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      label: 'Inactive',
    },
    DC: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'DC',
    },
  };

  const config = statusConfig[status] || statusConfig.Inactive;

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
