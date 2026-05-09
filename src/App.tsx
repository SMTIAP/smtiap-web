import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import ForgotPassword from "./pages/Forgot-password";
import OrganizationAdmin from "./pages/OrganizationAdmin";
import CreatorDashboard from "./pages/CreatorDashboard";
import LandingPage from "./pages/LandingPage";
import CreatedSurveys from "./pages/CreatedSurveys";
import SearchTemplate from "./pages/SearchTemplate";
import CreateNewSurvey from "./pages/CreateNewSurvey";
import AddQuestions from "./pages/AddQuestions";
import ReviewAndPublish from "./pages/ReviewAndPublish";
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
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import ShareSurvey from "./pages/ShareSurvey";
import TakeSurvey from "./pages/TakeSurvey";
import SurveyResults from "./pages/SurveyResults";
import OrganizationRegistration from "./pages/OrganizationRegistration.tsx";

function Layout() {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/take-survey/:surveyId" element={<TakeSurvey />} />
        {/* Auth Routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/take-survey/:surveyId" element={<TakeSurvey />} />

        {/* Layout wrapper for all routes */}
        <Route element={<Layout />}>
          {/* Public Route */}
          <Route path="/" element={<LandingPage />} />

          {/* Protected tenant routes */}
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
            element={
              <ProtectedRoute>
                <CreatorDashboard />
              </ProtectedRoute>
            }
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
            path="/survey-results/:surveyId"
            element={
              <ProtectedRoute>
                <SurveyResults />
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
    </BrowserRouter>
  );
}
