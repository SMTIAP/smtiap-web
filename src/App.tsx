import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OrganizationAdmin from './pages/OrganizationAdmin';
import CreatedSurveys from './pages/CreatedSurveys';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OrganizationAdmin />} />
        <Route path="/created-surveys" element={<CreatedSurveys />} />
        <Route path="/create-new" element={<div>Create New Survey Page</div>} />
      </Routes>
    </BrowserRouter>
  );
}