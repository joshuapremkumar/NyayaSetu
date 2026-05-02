import { createBrowserRouter } from 'react-router-dom';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import WorkspacePage from './pages/WorkspacePage';
import VerificationPage from './pages/VerificationPage';
import GovernancePage from './pages/GovernancePage';

/**
 * CourtAction AI Router Configuration
 * Using createBrowserRouter for enterprise scalability
 * 
 * Route Structure:
 * - Public routes: Landing, Login
 * - Protected routes: Dashboard (with nested routes)
 */
export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  
  // Protected Routes (Dashboard)
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'upload',
        element: <UploadPage />,
      },
      {
        path: 'workspace/:caseId',
        element: <WorkspacePage />,
      },
      {
        path: 'verification/:caseId',
        element: <VerificationPage />,
      },
      {
        path: 'governance',
        element: <GovernancePage />,
      },
    ],
  },
]);
