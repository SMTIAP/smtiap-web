import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/Forgot-password';
import OrganizationAdmin from './pages/OrganizationAdmin';
import CreatedSurveys from './pages/CreatedSurveys';
import SearchTemplate from './pages/SearchTemplate';
import CreateNewSurvey from './pages/CreateNewSurvey';
import AddQuestions from './pages/AddQuestions';
import ReviewAndPublish from './pages/ReviewAndPublish';
import Response from './pages/Response';
import Analytics from './pages/Analytics';
import RoleManagement from './pages/RoleManagement';
import Subscription from './pages/Subscription';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Dashboard & Survey Management */}
        <Route path="/" element={<OrganizationAdmin />} />
        <Route path="/created-surveys" element={<CreatedSurveys />} />
        <Route path="/templates" element={<SearchTemplate />} />
        <Route path="/subscription" element={<Subscription />} />
        
        {/* Survey Creation Flow */}
        <Route path="/create-new-survey" element={<CreateNewSurvey />} />
        <Route path="/add-questions" element={<AddQuestions />} />
        <Route path="/review-publish" element={<ReviewAndPublish />} />

        {/* Analytics & Responses */}
        <Route path="/response" element={<Response />} />
        <Route path="/analytics" element={<Analytics />} />

        {/* Role Management */}
        <Route path="/role-management" element={<RoleManagement />} />
      </Routes>
    </BrowserRouter>
  );
}
