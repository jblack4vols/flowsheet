import { useAuth } from '../contexts/AuthContext';
import { ALL_CLINICS } from '../constants';
import { MapPin } from 'lucide-react';

export default function SettingsPage() {
  const { profile, isAdmin } = useAuth();

  const clinicDetails = {
    'Morristown': 'Main Facility',
    'Bean Station': 'Branch Office',
    'New Tazewell': 'Clinic',
    'Maryville': 'Clinic',
    'Newport': 'Clinic',
    'Rogersville': 'Clinic',
    'Jefferson City': 'Clinic',
    'Johnson City': 'Clinic',
  };

  const clinicList = ALL_CLINICS.filter((c) => c !== 'All Clinics');

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 font-medium">Full Name</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {profile?.full_name || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Email</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {profile?.email || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Role</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {profile?.role || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Clinic</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {profile?.clinic || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Clinic Locations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Clinic Locations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {clinicList.map((clinic) => (
            <div key={clinic} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-brand-orange mt-1" size={20} />
                <div>
                  <p className="font-semibold text-gray-900">{clinic}</p>
                  <p className="text-sm text-gray-600">
                    {clinicDetails[clinic] || 'Clinic'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Section */}
      {isAdmin && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Tools</h2>
          <p className="text-gray-600 mb-4">
            User management and system configuration tools are available in the admin panel.
          </p>
          <button
            disabled
            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg font-medium cursor-not-allowed"
          >
            User Management (Coming Soon)
          </button>
        </div>
      )}
    </div>
  );
}
