import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
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
import Audit from "./pages/Audit";
import NavBar from "./components/NavBar.tsx";
import ShareSurvey from './pages/ShareSurvey';
import TakeSurvey from './pages/TakeSurvey';
import SurveyResults from './pages/SurveyResults';

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
        {/* Layout wrapper for all routes */}
        <Route element={<Layout />}>
          {/* Auth Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Dashboard & Survey Management */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<OrganizationAdmin />} />
          <Route path="/creator-dashboard" element={<CreatorDashboard />} />
          <Route path="/created-surveys" element={<CreatedSurveys />} />
          <Route path="/templates" element={<SearchTemplate />} />
          <Route path="/subscription" element={<Subscription />} />
          

          {/* Survey Creation Flow */}
          <Route path="/create-new-survey" element={<CreateNewSurvey />} />
          <Route path="/add-questions" element={<AddQuestions />} />
          <Route path="/review-publish" element={<ReviewAndPublish />} />
          <Route path="/share-survey" element={<ShareSurvey />} />
          <Route path="/survey-results/:surveyId" element={<SurveyResults />} />

          {/* Analytics & Responses */}
          <Route path="/response" element={<Response />} />
          <Route path="/analytics" element={<Analytics />} />
          {/* Role Management */}
          <Route path="/role-management" element={<RoleManagement />} />
          {/* Audit Management */}
          <Route path="/audit-log" element={<Audit />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
