import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';

import PassengerLogin from './pages/PassengerLogin';
import StaffLogin from './pages/StaffLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SearchTrain from './pages/SearchTrain';
import BookTicket from './pages/BookTicket';
import StationMap from './pages/StationMap';
import OrderFood from './pages/OrderFood';
import CleaningRequest from './pages/CleaningRequest';
import FileComplaint from './pages/FileComplaint';
import TechnicalIssue from './pages/TechnicalIssue';
import TrainUpdates from './pages/TrainUpdates';
import MyBookings from './pages/MyBookings';

import StaffCleaningDashboard from './pages/staff/StaffCleaningDashboard';
import StaffTCDashboard from './pages/staff/StaffTCDashboard';
import StaffPoliceDashboard from './pages/staff/StaffPoliceDashboard';
import StaffElectricalDashboard from './pages/staff/StaffElectricalDashboard';
import StaffPilotDashboard from './pages/staff/StaffPilotDashboard';
import StaffStationMasterDashboard from './pages/staff/StaffStationMasterDashboard';

import RailBot from './components/RailBot';

const STAFF_ROLE_PAGES: Record<string, string> = {
  TC: 'staff-tc',
  CLEANER_MANAGER: 'staff-cleaning',
  CLEANER_WORKER: 'staff-cleaning',
  POLICE: 'staff-police',
  ELECTRICAL: 'staff-electrical',
  PILOT: 'staff-pilot',
  STATION_MASTER: 'staff-station-master',
};

function AppContent() {
  const { session, staffProfile, loading } = useAuth();
  const { current, navigate } = useNavigation();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      if (!['passenger-login', 'staff-login', 'register'].includes(current.page)) {
        navigate('passenger-login');
      }
      return;
    }
    if (['passenger-login', 'staff-login', 'register'].includes(current.page)) {
      if (staffProfile) {
        const page = STAFF_ROLE_PAGES[staffProfile.role];
        if (page) navigate(page as Parameters<typeof navigate>[0]);
      } else {
        navigate('dashboard');
      }
    }
  }, [session, loading, staffProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060e1e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#FF9933] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/40 text-sm">Loading RailSaathi...</p>
        </div>
      </div>
    );
  }

  const isStaffPage = current.page.startsWith('staff-');
  const showRailBot = session && !isStaffPage && current.page !== 'passenger-login' && current.page !== 'staff-login' && current.page !== 'register';

  const renderPage = () => {
    switch (current.page) {
      case 'passenger-login': return <PassengerLogin />;
      case 'staff-login': return <StaffLogin />;
      case 'register': return <Register />;
      case 'dashboard': return <Dashboard />;
      case 'search-train': return <SearchTrain />;
      case 'book-ticket': return <BookTicket />;
      case 'station-map': return <StationMap />;
      case 'order-food': return <OrderFood />;
      case 'cleaning-request': return <CleaningRequest />;
      case 'file-complaint': return <FileComplaint />;
      case 'technical-issue': return <TechnicalIssue />;
      case 'train-updates': return <TrainUpdates />;
      case 'my-bookings': return <MyBookings />;
      case 'pnr-status': return <MyBookings />;
      case 'staff-cleaning': return <StaffCleaningDashboard />;
      case 'staff-tc': return <StaffTCDashboard />;
      case 'staff-police': return <StaffPoliceDashboard />;
      case 'staff-electrical': return <StaffElectricalDashboard />;
      case 'staff-pilot': return <StaffPilotDashboard />;
      case 'staff-station-master': return <StaffStationMasterDashboard />;
      default: return <PassengerLogin />;
    }
  };

  return (
    <>
      {renderPage()}
      {showRailBot && <RailBot />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </AuthProvider>
  );
}
