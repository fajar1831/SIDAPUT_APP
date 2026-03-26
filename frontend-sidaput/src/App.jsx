import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';

// IMPORT SEMUA HALAMAN KITA
import Dashboard from './pages/Dashboard';
import TransaksiHarian from './pages/TransaksiHarian';
import Laporan from './pages/Laporan';
import DataNelayan from './pages/DataNelayan';
import DataIkan from './pages/DataIkan';
import DataAlatTangkap from './pages/DataAlatTangkap';
import Login from './pages/Login'; 

const styleCSS = `
  body { background-color: #f8fafc; }
  
  .sidebar-container {
    background-color: #1e3a8a; 
    width: 260px;
    min-width: 260px;
    height: 100vh;
    box-shadow: 4px 0 10px rgba(0, 0, 0, 0.05);
    color: #ffffff;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
  }
  
  .sidebar-brand { padding: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 0.5rem; }
  .brand-title { font-size: 1.25rem; font-weight: 800; letter-spacing: 1px; color: #ffffff; margin: 0; }
  .brand-subtitle { font-size: 0.7rem; color: #93c5fd; margin: 0; font-weight: 500; }
  
  .nav-category { padding: 1rem 1.5rem 0.5rem; font-size: 0.65rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; }
  .nav-item-formal { margin: 0.15rem 1rem; list-style: none; }
  .nav-link-formal {
    display: flex; align-items: center; padding: 0.75rem 1rem; color: #cbd5e1; 
    text-decoration: none; border-radius: 4px; font-size: 0.85rem; font-weight: 500; transition: all 0.2s;
  }
  .nav-link-formal:hover { color: #ffffff; background-color: rgba(255, 255, 255, 0.08); }
  .nav-link-formal.active { background-color: #ffffff; color: #1e3a8a; font-weight: 700; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  .nav-link-formal i { font-size: 1.1rem; margin-right: 0.75rem; width: 20px; text-align: center; }
  
  .sidebar-footer { margin-top: auto; padding: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
  .footer-text { font-size: 0.7rem; color: #cbd5e1; margin: 0; line-height: 1.4; }
  
  /* Tombol Logout */
  .btn-logout {
    background-color: rgba(255, 255, 255, 0.05);
    color: #f87171; /* Merah kalem biar elegan */
    border: 1px solid rgba(248, 113, 113, 0.2);
    border-radius: 4px;
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    font-weight: 600;
    width: 100%;
    text-align: left;
    transition: all 0.2s;
    cursor: pointer;
  }
  .btn-logout:hover {
    background-color: rgba(248, 113, 113, 0.1);
    color: #ef4444;
  }

  .main-content { flex-grow: 1; height: 100vh; overflow-y: auto; width: calc(100% - 260px); }

  /* Tombol Logout */
  .btn-logout {
    background-color: rgba(255, 255, 255, 0.05);
    color: #f87171; 
    border: 1px solid rgba(248, 113, 113, 0.2);
    border-radius: 4px;
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    font-weight: 600;
    width: 100%;
    
    /* === BAGIAN INI YANG BIKIN KE TENGAH === */
    display: flex;
    justify-content: center;
    align-items: center;
    
    transition: all 0.2s;
    cursor: pointer;
  }
`;

function LayoutUtama() {
  const lokasi = useLocation(); 
  const navigate = useNavigate(); // Kita butuh ini buat mindahin halaman ke /login
  const apakahHalamanLogin = lokasi.pathname === '/login';

  // FUNGSI UNTUK LOGOUT
  const prosesLogout = () => {
    // Kasih konfirmasi dulu biar nggak kepencet ga sengaja
    const yakin = window.confirm("Apakah Anda yakin ingin keluar dari sistem SIDAPUT?");
    if (yakin) {
      // Hapus memori login-nya
      localStorage.removeItem('isLoggedIn');
      // Lempar balik ke halaman login
      navigate('/login');
    }
  };

  if (apakahHalamanLogin) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="d-flex">
      
      {/* --- KOTAK KIRI (SIDEBAR) --- */}
      <div className="sidebar-container d-print-none">
        <div className="sidebar-brand text-center">
            <i className="bi-tsunami text-white mb-2 d-block" style={{ fontSize: '2rem' }}></i>
            <h1 className="brand-title">SIDAPUT</h1>
            <p className="brand-subtitle">Dinas Perikanan & Kelautan</p>
        </div>

        <ul className="p-0 m-0">
            <div className="nav-category">Dasbor Eksekutif</div>
            <li className="nav-item-formal">
              <NavLink to="/" className="nav-link-formal" end><i className="bi-grid-fill"></i> Dasbor Utama</NavLink>
            </li>

            <div className="nav-category mt-2">Manajemen Transaksi</div>
            <li className="nav-item-formal">
              <NavLink to="/input-harian" className="nav-link-formal"><i className="bi-pencil-square"></i> Entri Data Produksi</NavLink>
            </li>
            <li className="nav-item-formal">
              <NavLink to="/laporan" className="nav-link-formal"><i className="bi-file-earmark-text-fill"></i> Dokumen Laporan</NavLink>
            </li>

            <div className="nav-category mt-2">Referensi Master Data</div>
            <li className="nav-item-formal">
              <NavLink to="/data-nelayan" className="nav-link-formal"><i className="bi-people-fill"></i> Direktori Nelayan</NavLink>
            </li>
            <li className="nav-item-formal">
              <NavLink to="/data-ikan" className="nav-link-formal"><i className="bi-bookmark-dash-fill"></i> Komoditas Ikan</NavLink>
            </li>
            <li className="nav-item-formal">
              <NavLink to="/alat-tangkap" className="nav-link-formal"><i className="bi-tools"></i> Instrumen Tangkap</NavLink>
            </li>
        </ul>

        {/* --- FOOTER DENGAN TOMBOL LOGOUT --- */}
        <div className="sidebar-footer">
            <button onClick={prosesLogout} className="btn-logout mb-3">
              <i className="bi-box-arrow-left me-2"></i> LOGOUT
            </button>
            <div className="text-center">
              <p className="footer-text">
                &copy; {new Date().getFullYear()} SIDAPUT<br/>
                Sistem Informasi Data Perikanan
              </p>
            </div>
        </div>
      </div>

      {/* --- KOTAK KANAN (ISI HALAMAN) --- */}
      <div className="main-content">
        <div className="p-4 p-md-5">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/input-harian" element={<TransaksiHarian />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/data-nelayan" element={<DataNelayan />} />
            <Route path="/data-ikan" element={<DataIkan />} />
            <Route path="/alat-tangkap" element={<DataAlatTangkap />} />
          </Routes>
        </div>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <Router>
      <style>{styleCSS}</style>
      <LayoutUtama />
    </Router>
  );
}