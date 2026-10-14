import { useAuth } from '../contexts/AuthContext';
import { BRAND, ALL_CLINICS } from '../constants';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function Dashboard({ patients = [], visits = [] }) {
  const { selectedClinic } = useAuth();

  // Filter by clinic
  const filteredPatients = selectedClinic === 'All Clinics'
    ? patients
    : patients.filter((p) => p.clinic === selectedClinic);

  const filteredVisits = selectedClinic === 'All Clinics'
    ? visits
    : visits.filter((v) => {
        const patient = patients.find((p) => p.id === v.patient_id);
        return patient && patient.clinic === selectedClinic;
      });

  // Calculate stats
  const totalPatients = filteredPatients.length;
  const activePatients = filteredPatients.filter((p) => p.status === 'Active').length;
  const inactivePatients = filteredPatients.filter((p) => p.status === 'Inactive').length;
  const dcPatients = filteredPatients.filter((p) => p.status === 'DC').length;

  const today = new Date().toISOString().split('T')[0];
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const thisWeekStartStr = thisWeekStart.toISOString().split('T')[0];

  const visitsToday = filteredVisits.filter((v) => v.date === today).length;
  const visitsThisWeek = filteredVisits.filter(
    (v) => v.date >= thisWeekStartStr && v.date <= today
  ).length;

  // Chart data: patients by clinic
  const chartData = selectedClinic === 'All Clinics'
    ? ALL_CLINICS.filter((c) => c !== 'All Clinics').map((clinic) => ({
        name: clinic,
        count: patients.filter((p) => p.clinic === clinic).length,
      }))
    : [];

  const statCards = [
    { label: 'Total Patients', value: totalPatients, color: 'bg-blue-100' },
    { label: 'Active', value: activePatients, color: 'bg-green-100' },
    { label: 'Inactive', value: inactivePatients, color: 'bg-amber-100' },
    { label: 'Discharged', value: dcPatients, color: 'bg-red-100' },
    { label: 'Visits Today', value: visitsToday, color: 'bg-purple-100' },
    { label: 'This Week', value: visitsThisWeek, color: 'bg-indigo-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className={`${card.color} rounded-lg p-4`}>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              {card.label}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {selectedClinic === 'All Clinics' && chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Patients by Clinic
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill={BRAND.orange} radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={BRAND.orange} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Recent Activity
        </h3>
        {filteredVisits.length > 0 ? (
          <div className="space-y-3">
            {filteredVisits.slice(0, 5).map((visit) => {
              const patient = patients.find((p) => p.id === visit.patient_id);
              return (
                <div
                  key={visit.visit_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {patient?.first_name} {patient?.last_name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(visit.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      BP: {visit.bp}
                    </p>
                    <p className="text-sm text-gray-600">HR: {visit.hr}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600">No recent activity</p>
        )}
      </div>
    </div>
  );
}
