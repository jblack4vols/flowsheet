import { BRAND } from '../constants';

export default function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
        active ? 'bg-gray-700 border-l-4 border-gray-700' : 'hover:bg-gray-800'
      }`}
      style={{
        backgroundColor: active ? BRAND.darkAlt : undefined,
        borderLeftColor: active ? BRAND.orange : undefined,
      }}
    >
      {Icon && <Icon size={20} className={active ? 'text-brand-orange' : 'text-gray-400'} />}
      <span className={`font-medium ${active ? 'text-white' : 'text-gray-300'}`}>
        {label}
      </span>
    </button>
  );
}
