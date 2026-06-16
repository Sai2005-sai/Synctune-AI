import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate } from
'react-router-dom';
import { Menu, X } from 'lucide-react';
// We will import all pages here as we build them.
// For now, we'll create placeholder components for the ones not built yet.
// Auth Flow
import SplashScreen from './pages/SplashScreen';
import Onboarding1 from './pages/Onboarding1';
import Onboarding2 from './pages/Onboarding2';
import SignIn from './pages/SignIn';
import Register from './pages/Register';
// Home Flow
import HomeDashboard from './pages/HomeDashboard';
import UploadVideo from './pages/UploadVideo';
import VideoPicker from './pages/VideoPicker';
import VideoPreview from './pages/VideoPreview';
import PromptInput from './pages/PromptInput';
// Analysis Flow
import AnalyzeLoading from './pages/AnalyzeLoading';
import AnalysisSummary from './pages/AnalysisSummary';
import DetailedAnalysis from './pages/DetailedAnalysis';
import InsightsScreen from './pages/InsightsScreen';
// Music Selection
import RecommendedTracks from './pages/RecommendedTracks';
import TrackDetails from './pages/TrackDetails';
import MultiTrackSelection from './pages/MultiTrackSelection';
// Variation + Sync
import AudioVariationPlan from './pages/AudioVariationPlan';
import SegmentDetail from './pages/SegmentDetail';
import SegmentEditor from './pages/SegmentEditor';
import SyncProcessing from './pages/SyncProcessing';
import SyncResult from './pages/SyncResult';
import ManualAdjustment from './pages/ManualAdjustment';
// Preview Flow
import PreviewScreen from './pages/PreviewScreen';
import FullscreenPreview from './pages/FullscreenPreview';
import CompareView from './pages/CompareView';
// Export Flow
import ExportSettings from './pages/ExportSettings';
import ExportProcessing from './pages/ExportProcessing';
import ExportSuccess from './pages/ExportSuccess';
// Extra Screens
import ProjectHistory from './pages/ProjectHistory';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Subscription from './pages/Subscription';
import Settings from './pages/Settings';
import HelpFAQ from './pages/HelpFAQ';
import AboutApp from './pages/AboutApp';

const DevNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const routes = [
  {
    path: '/splash',
    name: 'Splash Screen',
    group: 'Auth'
  },
  {
    path: '/onboarding-1',
    name: 'Onboarding 1',
    group: 'Auth'
  },
  {
    path: '/onboarding-2',
    name: 'Onboarding 2',
    group: 'Auth'
  },
  {
    path: '/sign-in',
    name: 'Sign In',
    group: 'Auth'
  },
  {
    path: '/register',
    name: 'Register',
    group: 'Auth'
  },
  {
    path: '/',
    name: 'Home Dashboard',
    group: 'Home'
  },
  {
    path: '/upload',
    name: 'Upload Video',
    group: 'Home'
  },
  {
    path: '/video-picker',
    name: 'Video Picker',
    group: 'Home'
  },
  {
    path: '/video-preview',
    name: 'Video Preview',
    group: 'Home'
  },
  {
    path: '/prompt-input',
    name: 'Prompt Input',
    group: 'Home'
  },
  {
    path: '/analyze-loading',
    name: 'Analyze Loading',
    group: 'Analysis'
  },
  {
    path: '/analysis-summary',
    name: 'Analysis Summary',
    group: 'Analysis'
  },
  {
    path: '/detailed-analysis',
    name: 'Detailed Analysis',
    group: 'Analysis'
  },
  {
    path: '/insights',
    name: 'Insights Screen',
    group: 'Analysis'
  },
  {
    path: '/recommended-tracks',
    name: 'Recommended Tracks',
    group: 'Music'
  },
  {
    path: '/track-details',
    name: 'Track Details',
    group: 'Music'
  },
  {
    path: '/multi-track',
    name: 'Multi Track Selection',
    group: 'Music'
  },
  {
    path: '/variation-plan',
    name: 'Audio Variation Plan',
    group: 'Sync'
  },
  {
    path: '/segment-detail',
    name: 'Segment Detail',
    group: 'Sync'
  },
  {
    path: '/segment-editor',
    name: 'Segment Editor',
    group: 'Sync'
  },
  {
    path: '/sync-processing',
    name: 'Sync Processing',
    group: 'Sync'
  },
  {
    path: '/sync-result',
    name: 'Sync Result',
    group: 'Sync'
  },
  {
    path: '/manual-adjust',
    name: 'Manual Adjustment',
    group: 'Sync'
  },
  {
    path: '/preview',
    name: 'Preview Screen',
    group: 'Preview'
  },
  {
    path: '/fullscreen-preview',
    name: 'Fullscreen Preview',
    group: 'Preview'
  },
  {
    path: '/compare',
    name: 'Compare View',
    group: 'Preview'
  },
  {
    path: '/export-settings',
    name: 'Export Settings',
    group: 'Export'
  },
  {
    path: '/export-processing',
    name: 'Export Processing',
    group: 'Export'
  },
  {
    path: '/export-success',
    name: 'Export Success',
    group: 'Export'
  },
  {
    path: '/projects',
    name: 'Project History',
    group: 'Extra'
  },
  {
    path: '/profile',
    name: 'Profile',
    group: 'Extra'
  },
  {
    path: '/settings',
    name: 'Settings',
    group: 'Extra'
  },
  {
    path: '/help',
    name: 'Help / FAQ',
    group: 'Extra'
  },
  {
    path: '/about',
    name: 'About App',
    group: 'Extra'
  }];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-[100] bg-dark-surface border border-white/20 p-2 rounded-full shadow-lg text-white hover:bg-white/10 transition-colors">
        
        <Menu size={20} />
      </button>

      {isOpen &&
      <div className="fixed inset-0 z-[101] bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-80 bg-dark-bg h-full border-l border-white/10 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-dark-surface">
              <h2 className="font-display font-bold text-lg text-white">
                Dev Navigation
              </h2>
              <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full text-white">
              
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {[
            'Auth',
            'Home',
            'Analysis',
            'Music',
            'Sync',
            'Preview',
            'Export',
            'Extra'].
            map((group) =>
            <div key={group}>
                  <h3 className="text-accent-cyan text-xs font-bold uppercase tracking-wider mb-2">
                    {group}
                  </h3>
                  <div className="space-y-1">
                    {routes.
                filter((r) => r.group === group).
                map((route) =>
                <Link
                  key={route.path}
                  to={route.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${location.pathname === route.path ? 'bg-gradient-accent text-white font-medium' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}>
                  
                          {route.name}
                        </Link>
                )}
                  </div>
                </div>
            )}
            </div>
          </div>
        </div>
      }
    </>);

};
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/splash" replace />;
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to="/home" replace />;
  return <>{children}</>;
};

const AppContent = () => {
  return (
    <>
      <DevNav />
      <Routes>
        {/* Auth Flow */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/splash" element={<Navigate to="/" replace />} />
        <Route path="/onboarding-1" element={<AuthRoute><Onboarding1 /></AuthRoute>} />
        <Route path="/onboarding-2" element={<AuthRoute><Onboarding2 /></AuthRoute>} />
        <Route path="/sign-in" element={<AuthRoute><SignIn /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

        {/* Home Flow (Protected) */}
        <Route path="/home" element={<ProtectedRoute><HomeDashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><UploadVideo /></ProtectedRoute>} />
        <Route path="/video-picker" element={<ProtectedRoute><VideoPicker /></ProtectedRoute>} />
        <Route path="/video-preview" element={<ProtectedRoute><VideoPreview /></ProtectedRoute>} />
        <Route path="/prompt-input" element={<ProtectedRoute><PromptInput /></ProtectedRoute>} />

        {/* Analysis Flow */}
        <Route path="/analyze-loading" element={<ProtectedRoute><AnalyzeLoading /></ProtectedRoute>} />
        <Route path="/analysis-summary" element={<ProtectedRoute><AnalysisSummary /></ProtectedRoute>} />
        <Route path="/detailed-analysis" element={<ProtectedRoute><DetailedAnalysis /></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><InsightsScreen /></ProtectedRoute>} />

        {/* Music Selection */}
        <Route path="/recommended-tracks" element={<ProtectedRoute><RecommendedTracks /></ProtectedRoute>} />
        <Route path="/track-details" element={<ProtectedRoute><TrackDetails /></ProtectedRoute>} />
        <Route path="/multi-track" element={<ProtectedRoute><MultiTrackSelection /></ProtectedRoute>} />

        {/* Variation + Sync */}
        <Route path="/variation-plan" element={<ProtectedRoute><AudioVariationPlan /></ProtectedRoute>} />
        <Route path="/segment-detail" element={<ProtectedRoute><SegmentDetail /></ProtectedRoute>} />
        <Route path="/segment-editor" element={<ProtectedRoute><SegmentEditor /></ProtectedRoute>} />
        <Route path="/sync-processing" element={<ProtectedRoute><SyncProcessing /></ProtectedRoute>} />
        <Route path="/sync-result" element={<ProtectedRoute><SyncResult /></ProtectedRoute>} />
        <Route path="/manual-adjust" element={<ProtectedRoute><ManualAdjustment /></ProtectedRoute>} />

        {/* Preview Flow */}
        <Route path="/preview" element={<ProtectedRoute><PreviewScreen /></ProtectedRoute>} />
        <Route path="/fullscreen-preview" element={<ProtectedRoute><FullscreenPreview /></ProtectedRoute>} />
        <Route path="/compare" element={<ProtectedRoute><CompareView /></ProtectedRoute>} />

        {/* Export Flow */}
        <Route path="/export-settings" element={<ProtectedRoute><ExportSettings /></ProtectedRoute>} />
        <Route path="/export-processing" element={<ProtectedRoute><ExportProcessing /></ProtectedRoute>} />
        <Route path="/export-success" element={<ProtectedRoute><ExportSuccess /></ProtectedRoute>} />

        {/* Extra Screens */}
        <Route path="/projects" element={<ProtectedRoute><ProjectHistory /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><HelpFAQ /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><AboutApp /></ProtectedRoute>} />
      </Routes>
    </>
  );
};

import { GoogleOAuthProvider } from '@react-oauth/google';

export function App() {
  // Replace this with your actual Google OAuth Client ID
  const GOOGLE_CLIENT_ID = "61136341892-o6a6pcabnolhj2ec3jidmfron4bept0e.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}