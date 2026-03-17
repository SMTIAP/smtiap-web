import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OrganizationAdmin from './pages/OrganizationAdmin';
import CreatedSurveys from './pages/CreatedSurveys';
import SearchTemplate from './pages/SearchTemplate'; 
import CreateNewSurvey from './pages/CreateNewSurvey';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OrganizationAdmin />} />
        <Route path="/created-surveys" element={<CreatedSurveys />} />
        <Route path="/create-new" element={<div>Create New Survey Page</div>} />
        <Route path="/templates" element={<SearchTemplate />} />
        <Route path="/create-new-survey" element={<CreateNewSurvey />} />
      </Routes>
    </BrowserRouter>
  );
}