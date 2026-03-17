import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/Forgot-password';
import OrganizationAdmin from './pages/OrganizationAdmin';
import CreatedSurveys from './pages/CreatedSurveys';
import SearchTemplate from './pages/SearchTemplate';
import CreateNewSurvey from './pages/CreateNewSurvey';
import AddQuestions from './pages/AddQuestions'; // Make sure this file name is exact!
import ReviewAndPublish from './pages/ReviewAndPublish';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Dashboard & Survey Routes */}
        <Route path="/" element={<OrganizationAdmin />} />
        <Route path="/created-surveys" element={<CreatedSurveys />} />
        <Route path="/templates" element={<SearchTemplate />} />
        
        {/* Survey Creation Flow */}
        <Route path="/create-new-survey" element={<CreateNewSurvey />} />
        <Route path="/add-questions" element={<AddQuestions />} />
        <Route path="/review-publish" element={<ReviewAndPublish />} />
      </Routes>
    </Router>
  );
}
