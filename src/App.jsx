import { Routes, Route } from 'react-router-dom';
import SiteLayout from './layouts/SiteLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Sobre from './pages/Sobre';
import CursosPage from './pages/CursosPage';
import DiretoriaPage from './pages/DiretoriaPage';
import DocumentosPage from './pages/DocumentosPage';
import ContatoPage from './pages/ContatoPage';
import Filiacao from './pages/Filiacao';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/cursos" element={<CursosPage />} />
        <Route path="/diretoria" element={<DiretoriaPage />} />
        <Route path="/documentos" element={<DocumentosPage />} />
        <Route path="/contato" element={<ContatoPage />} />
        <Route path="/filiacao" element={<Filiacao />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}
