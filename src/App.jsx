import { useState, useEffect } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Loader,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { fetchPatients, fetchVisits, updatePatientStatus, insertVisit, fetchAuditLog } from './lib/supabase';
import { BRAND, ALL_CLINICS } from './constants';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import PatientsList from './components/PatientsList';
import PatientDetail from './components/PatientDetail';
import AuditLogViewer from './components/AuditLogViewer';
import SettingsPage from './components/SettingsPage';
import NavItem from './components/NavItem';

export default function App() {
  const { user, profile, loading, selectedClinic, setSelectedClinic, signOut, addAuditEntry, isAdmin } = useAuth();

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Data State
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  // Load data on mount
  useEffect(() => {
    if (user && !loading) {
      loadData();
    }
  }, [user, loading]);

  const loadData = async () => {
    try {
      setDataLoading(true);
      setDataError(null);
      const [patientsData, visitsData] = await Promise.all([
        fetchPatients(),
        fetchVisits(),
      ]);
      setPatients(patientsData || []);
      setVisits(visitsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setDataError('Failed to load data. Please try again.');
    } finally {
      setDataLoading(false);
    }
  };

  const loadAuditLog = async () => {
    try {
      const log = await fetchAuditLog();
      setAuditLog(log || []);
    } catch (error) {
      console.error('Error loading audit log:', error);
    }
  };

  const handleStatusChange = async (patientId, newStatus) => {
    try {
      await updatePatientStatus(patientId, newStatus);
      setPatients(
        patients.map((p) =>
          p.id === patientId ? { ...p, status: newStatus } : p
        )
      );
      await addAuditEntry('UPDATE_PATIENT_STATUS', `Patient ${patientId} status changed to ${newStatus}`);
    } catch (error) {
      console.error('Error updating patient status:', error);
      alert('Failed to update patient status');
    }
  };

  const handleAddVisit = async (visitData) => {
    try {
      const newVisit = await insertVisit(visitData);
      setVisits([newVisit, ...visits]);

      // Update patient's last_visit
      const patientIndex = patients.findIndex((p) => p.id === visitData.patient_id);
      if (patientIndex !== -1) {
        const updatedPatients = [...patients];
        updatedPatients[patientIndex].last_visit = visitData.date;
        setPatients(updatedPatients);
      }

      await addAuditEntry('ADD_VISIT', `Visit added for patient ${visitData.patient_id}`);
      setSelectedPatient((prev) =>
        prev ? { ...prev, last_visit: visitData.date } : null
      );
    } catch (error) {
      console.error('Error adding visit:', error);
      alert('Failed to add visit');
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setCurrentPage('patient-detail');
    setSidebarOpen(false);
  };

  const handleBackFromDetail = () => {
    setSelectedPatient(null);
    setCurrentPage('patients');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setSelectedPatient(null);
    setSidebarOpen(false);

    if (page === 'audit-log') {
      loadAuditLog();
    }
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  // Show login page
  if (!user) {
    return <LoginPage />;
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
    { icon: Users, label: 'Patients', page: 'patients' },
    ...(isAdmin ? [{ icon: FileText, label: 'Audit Log', page: 'audit-log' }] : []),
    ...(isAdmin ? [{ icon: Settings, label: 'Settings', page: 'settings' }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div
        className={`fixed inset-0 z-40 md:static md:w-64 bg-brand-dark transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Backdrop on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="relative z-40 h-full md:bg-brand-dark bg-brand-dark flex flex-col p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="Tristar" className="h-10" />
            <div>
              <p className="font-bold text-white">PT Flowsheets</p>
              <p className="text-xs text-gray-400">Tristar</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.page}
                icon={item.icon}
                label={item.label}
                active={currentPage === item.page}
                onClick={() => handleNavigate(item.page)}
              />
            ))}
          </nav>

          {/* Clinic Selector */}
          <div className="mb-6 p-3 bg-brand-darkAlt rounded-lg">
            <label className="block text-xs text-gray-400 font-medium mb-2">
              Clinic
            </label>
            <select
              value={selectedClinic}
              onChange={(e) => setSelectedClinic(e.target.value)}
              className="w-full px-2 py-2 bg-brand-dark border border-gray-600 text-white rounded text-sm focus:ring-2 focus:ring-brand-orange"
            >
              {ALL_CLINICS.map((clinic) => (
                <option key={clinic} value={clinic}>
                  {clinic}
                </option>
              ))}
            </select>
          </div>

          {/* User Info */}
          <div className="p-3 bg-brand-darkAlt rounded-lg mb-4">
            <p className="text-xs text-gray-400 font-medium">User</p>
            <p className="text-sm font-semibold text-white mt-1">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-400 mt-1">{profile?.role}</p>
          </div>

          {/* Logout Button */}
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>

          {/* Small Logo at Bottom */}
          <div className="mt-6 pt-6 border-t border-gray-700 flex justify-center">
            <img src="/logo.png" alt="Logo" className="h-6 opacity-50" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Hamburger Menu */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-gray-600 hover:text-gray-900"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* Page Title */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentPage === 'dashboard' && 'Dashboard'}
                  {currentPage === 'patients' && 'Patients'}
                  {currentPage === 'patient-detail' && `${selectedPatient?.first_name} ${selectedPatient?.last_name}`}
                  {currentPage === 'audit-log' && 'Audit Log'}
                  {currentPage === 'settings' && 'Settings'}
                </h1>
              </div>
            </div>

            {/* Right Side Badges */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                HIPAA Compliant
              </div>
              {profile?.role && (
                <div
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: BRAND.orange }}
                >
                  {profile.role}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {dataLoading && currentPage !== 'audit-log' ? (
            <div className="flex items-center justify-center h-96">
              <Loader className="animate-spin" size={40} />
            </div>
          ) : dataError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{dataError}</p>
              <button
                onClick={loadData}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {currentPage === 'dashboard' && <Dashboard patients={patients} visits={visits} />}
              {currentPage === 'patients' && (
                <PatientsList
                  patients={patients}
                  onSelect={handleSelectPatient}
                  onStatusChange={handleStatusChange}
                />
              )}
              {currentPage === 'patient-detail' && (
                <PatientDetail
                  patient={selectedPatient}
                  visits={visits}
                  onAddVisit={handleAddVisit}
                  onBack={handleBackFromDetail}
                />
              )}
              {currentPage === 'audit-log' && <AuditLogViewer auditLog={auditLog} />}
              {currentPage === 'settings' && <SettingsPage />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
