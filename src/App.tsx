import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OrganizationAdmin from './pages/OrganizationAdmin';
import AllSurveys from './pages/AllSurveys';
import Response from './pages/Response';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* We can map different pages to different paths here */}
        <Route path="/" element={<OrganizationAdmin />} />
        <Route path="/surveys" element={<AllSurveys />} />
        <Route path="/response" element={<Response />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </BrowserRouter>
  );
}
