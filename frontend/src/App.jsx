import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Generate from './pages/Generate.jsx';
import Result from './pages/Result.jsx';
import Dashboard from './pages/Dashboard.jsx';
import RegisterApi from './pages/RegisterApi.jsx';
import ApiDetail from './pages/ApiDetail.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/result" element={<Result />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/apis/new" element={<RegisterApi />} />
        <Route path="/apis/:apiId" element={<ApiDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
