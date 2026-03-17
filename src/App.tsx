import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OrganizationAdmin from "./pages/OrganizationAdmin";
import CreatedSurveys from "./pages/CreatedSurveys"; // make sure this file exists

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OrganizationAdmin />} />
        <Route path="/created-surveys" element={<CreatedSurveys />} />
      </Routes>
    </Router>
  );
}