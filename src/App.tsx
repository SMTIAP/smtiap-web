import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "sonner";
import ForgotPassword from "./pages/Forgot-password";
import OrganizationAdmin from "./pages/OrganizationAdmin";
import LandingPage from "./pages/LandingPage";
import CreatedSurveys from "./pages/CreatedSurveys";
import SearchTemplate from "./pages/SearchTemplate";
import TemplatePreview from "./pages/TemplatePreview";
import CreateNewSurvey from "./pages/CreateNewSurvey";
import AddQuestions from "./pages/AddQuestions";
import ReviewAndPublish from "./pages/ReviewAndPublish";
import SurveySettings from "./pages/SurveySettings";
import Response from "./pages/Response";
import Analytics from "./pages/Analytics";
import RoleManagement from "./pages/RoleManagement";
import Subscription from "./pages/Subscription";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import Audit from "./pages/Audit";
import NotificationsPage from "./pages/NotificationsPage";
import NavBar from "./components/NavBar.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import VerifyEmail from "./pages/VerifyEmail.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import ShareSurvey from "./pages/ShareSurvey";
import TakeSurvey from "./pages/TakeSurvey";
import SurveyResults from "./pages/SurveyResults";
import ScheduledSurveyPreview from "./pages/ScheduledSurveyPreview";
import OrganizationRegistration from "./pages/OrganizationRegistration.tsx";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminLogin from "./pages/SuperAdminLogin.tsx";
import SuperAdminTemplates from "./pages/SuperAdminTemplates";
import SuperAdminAuditLog from "./pages/SuperAdminAuditLog";
import SuperAdminTemplateEditor from "./pages/SuperAdminTemplateEditor";
import SuperAdminCategories from "./pages/SuperAdminCategories";
import VoiceAI from "./components/VoiceAI.tsx";
import { TenantProvider } from "./contexts/TenantContext";
import { DarkModeContext, getSavedTheme } from "./contexts/DarkModeContext";
import AboutPage from "./pages/AboutPage.tsx";
import Reports from "./pages/Reports.tsx";

function ThemeSync() {
  const { setDarkMode } = useContext(DarkModeContext);
  const location = useLocation();

  useEffect(() => {
    setDarkMode(getSavedTheme());
  }, [location.pathname, setDarkMode]);

  return null;
}

function Layout() {
  return (
    <>
      <NavBar />
      <Outlet />
      <VoiceAI />
    </>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(() => getSavedTheme());

  useEffect(() => {
    // Disable transitions temporarily to avoid mismatched theme updates
    document.documentElement.classList.add("disable-transitions");

    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Force reflow to paint layout changes instantly
    void document.documentElement.offsetHeight;

    // Restore transitions on the next tick
    const timer = setTimeout(() => {
      document.documentElement.classList.remove("disable-transitions");
    }, 0);

    return () => clearTimeout(timer);
  }, [darkMode]);

  const toggleDarkMode = () =>
    setDarkMode((prev) => {
      const next = !prev;
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode<{ id?: string }>(token);
          const userId = decoded?.id;
          if (userId) {
            localStorage.setItem(`theme_${userId}`, next ? "dark" : "light");
          }
        } catch {
          // ignore
        }
      }
      localStorage.setItem("theme_guest", next ? "dark" : "light");
      return next;
    });

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode, setDarkMode }}>
      <div className="min-h-screen bg-white dark:bg-[#0F172A] transition-colors duration-300">
        <BrowserRouter>
          <ThemeSync />
          <TenantProvider>
            <Routes>
              <Route path="/take-survey/:surveyId" element={<TakeSurvey />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/super-admin-login" element={<SuperAdminLogin />} />
              <Route
                path="/super-admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["super_admin"]}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Super Admin Template Management Routes */}
              <Route
                path="/super-admin/templates"
                element={
                  <ProtectedRoute allowedRoles={["super_admin"]}>
                    <SuperAdminTemplates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/templates/new"
                element={
                  <ProtectedRoute allowedRoles={["super_admin"]}>
                    <SuperAdminTemplateEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/templates/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={["super_admin"]}>
                    <SuperAdminTemplateEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/categories"
                element={
                  <ProtectedRoute allowedRoles={["super_admin"]}>
                    <SuperAdminCategories />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/super-admin/audit-log"
                element={
                  <ProtectedRoute allowedRoles={["super_admin"]}>
                    <SuperAdminAuditLog />
                  </ProtectedRoute>
                }
              />

              <Route element={<Layout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <OrganizationAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/creator-dashboard"
                  element={<Navigate to="/admin" replace />}
                />
                <Route
                  path="/created-surveys"
                  element={
                    <ProtectedRoute>
                      <CreatedSurveys />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/templates"
                  element={
                    <ProtectedRoute>
                      <SearchTemplate />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/template-preview"
                  element={
                    <ProtectedRoute>
                      <TemplatePreview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subscription"
                  element={
                    <ProtectedRoute>
                      <Subscription />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subscription/success"
                  element={
                    <ProtectedRoute>
                      <PaymentSuccess />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subscription/cancel"
                  element={
                    <ProtectedRoute>
                      <PaymentCancel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-new-survey"
                  element={
                    <ProtectedRoute>
                      <CreateNewSurvey />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-questions"
                  element={
                    <ProtectedRoute>
                      <AddQuestions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/review-publish"
                  element={
                    <ProtectedRoute>
                      <ReviewAndPublish />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/share-survey"
                  element={
                    <ProtectedRoute>
                      <ShareSurvey />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/survey-settings/:surveyId"
                  element={
                    <ProtectedRoute>
                      <SurveySettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/survey-results/:surveyId"
                  element={
                    <ProtectedRoute>
                      <SurveyResults />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/scheduled-survey-preview"
                  element={
                    <ProtectedRoute>
                      <ScheduledSurveyPreview />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/response"
                  element={
                    <ProtectedRoute>
                      <Response />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/role-management"
                  element={
                    <ProtectedRoute>
                      <RoleManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organization-registration"
                  element={<OrganizationRegistration />}
                />
                <Route
                  path="/audit-log"
                  element={
                    <ProtectedRoute>
                      <Audit />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </TenantProvider>
        </BrowserRouter>

        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={true}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme={darkMode ? "dark" : "light"}
        />
        <Toaster
          richColors
          position="bottom-right"
          theme={darkMode ? "dark" : "light"}
        />
      </div>
    </DarkModeContext.Provider>
  );
}
