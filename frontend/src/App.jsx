import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import LandingPilot from './pages/LandingPilot.jsx';
import Generate from './pages/Generate.jsx';
import Result from './pages/Result.jsx';
import Dashboard from './pages/Dashboard.jsx';
import RegisterApi from './pages/RegisterApi.jsx';
import ApiDetail from './pages/ApiDetail.jsx';

function PreviewRedirect() {
  const { search, hash } = useLocation();
  return <Navigate to={{ pathname: '/', search, hash }} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPilot />} />
        <Route path="/design-preview" element={<PreviewRedirect />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/result" element={<Result />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/endpoints" element={<Dashboard />} />
        <Route path="/dashboard/activity" element={<Dashboard />} />
        <Route path="/dashboard/payouts" element={<Dashboard />} />
        <Route path="/apis/new" element={<RegisterApi />} />
        <Route path="/apis/:apiId" element={<ApiDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
