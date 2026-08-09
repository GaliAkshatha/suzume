import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../../components/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import LandingPage from "../../pages/Landing/LandingPage";
import LoginPage from "../../pages/Auth/LoginPage";
import RegisterPage from "../../pages/Auth/RegisterPage";
import ForgotPasswordPage from "../../pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "../../pages/Auth/ResetPasswordPage";
import DashboardPage from "../../pages/Dashboard/DashboardPage";
import ApplicationsPage from "../../pages/Applications/ApplicationsPage";
import ApplicationDetailsPage from "../../pages/ApplicationDetails/ApplicationDetailsPage";
import CalendarPage from "../../pages/Calendar/CalendarPage";
import ExperiencesPage from "../../pages/Experiences/ExperiencesPage";
import RecordExperiencePage from "../../pages/Experiences/RecordExperiencePage";
import ExperienceDetailsPage from "../../pages/ExperienceDetails/ExperienceDetailsPage";
import LearningsPage from "../../pages/Learnings/LearningsPage";
import PreparationPage from "../../pages/Preparation/PreparationPage";
import PreparationSetupPage from "../../pages/Preparation/PreparationSetupPage";
import AnalyticsPage from "../../pages/Analytics/AnalyticsPage";

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/preparation-setup", element: <PreparationSetupPage /> },
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/applications", element: <ApplicationsPage /> },
          { path: "/applications/:id", element: <ApplicationDetailsPage /> },
          { path: "/calendar", element: <CalendarPage /> },
          { path: "/experiences", element: <ExperiencesPage /> },
          { path: "/experiences/new", element: <RecordExperiencePage /> },
          { path: "/experiences/:id", element: <ExperienceDetailsPage /> },
          { path: "/learnings", element: <LearningsPage /> },
          { path: "/preparation", element: <PreparationPage /> },
          { path: "/analytics", element: <AnalyticsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
