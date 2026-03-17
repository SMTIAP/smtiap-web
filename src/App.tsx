import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/Forgot-password';
import OrganizationAdmin from './pages/OrganizationAdmin';
import CreatedSurveys from './pages/CreatedSurveys';
import SearchTemplate from './pages/SearchTemplate'; 
import CreateNewSurvey from './pages/CreateNewSurvey';

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
        <Route path="/create-new" element={<div>Create New Survey Page</div>} />
        <Route path="/templates" element={<SearchTemplate />} />
        <Route path="/create-new-survey" element={<CreateNewSurvey />} />
      </Routes>
    </Router>
  );
}
