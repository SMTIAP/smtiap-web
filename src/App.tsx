import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
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
import SuperAdminTemplateEditor from "./pages/SuperAdminTemplateEditor";
import SuperAdminCategories from "./pages/SuperAdminCategories";
import VoiceAI from "./components/VoiceAI.tsx";
import { TenantProvider } from "./contexts/TenantContext";

// Dark mode context
export const DarkModeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

export function useDarkMode() {
  return useContext(DarkModeContext);
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
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <div className="min-h-screen bg-white dark:bg-[#0F172A] transition-colors duration-300">
        <BrowserRouter>
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

              <Route element={<Layout />}>
                <Route path="/" element={<LandingPage />} />
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
        <Toaster richColors position="bottom-right" />
      </div>
    </DarkModeContext.Provider>
  );
}
