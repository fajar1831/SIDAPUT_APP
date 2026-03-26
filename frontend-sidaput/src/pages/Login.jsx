import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// CSS Tema Pemerintahan / Formal khusus Login
const styleCSS = `
  body { background-color: #f1f5f9; }
  .login-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  .login-card {
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.1);
    overflow: hidden;
    width: 100%;
    max-width: 900px;
    display: flex;
    border: 1px solid #e2e8f0;
  }
  .login-brand {
    background-color: #1e3a8a;
    color: #ffffff;
    padding: 3rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .login-form-container {
    flex: 1.2;
    padding: 3.5rem 4rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .form-control {
    border-radius: 4px;
    border: 1px solid #cbd5e1;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
  .form-control:focus {
    border-color: #1e3a8a;
    box-shadow: 0 0 0 0.2rem rgba(30, 58, 138, 0.15);
  }
  .btn-navy {
    background-color: #1e3a8a;
    color: white;
    border-radius: 4px;
    font-weight: 600;
    padding: 0.75rem;
    letter-spacing: 0.5px;
    transition: all 0.2s;
  }
  .btn-navy:hover {
    background-color: #172554;
    color: white;
  }
  .text-navy { color: #1e3a8a; }
  .text-slate { color: #475569; }

  /* Responsif untuk layar HP */
  @media (max-width: 768px) {
    .login-card { flex-direction: column; }
    .login-brand { padding: 2rem; }
    .login-form-container { padding: 2rem; }
  }
`;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulasi Login (Nanti bisa kamu ganti nembak API Laravel beneran)
    // axios.post('http://127.0.0.1:8000/api/login', { username, password })...
    
    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        // Kalau sukses, simpan token/status, lalu arahkan ke Dashboard
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/');
      } else {
        setError('Kredensial tidak valid. Periksa kembali nama pengguna dan kata sandi Anda.');
        setLoading(false);
      }
    }, 1000); // Simulasi loading 1 detik
  };

  return (
    <div className="login-wrapper">
      <style>{styleCSS}</style>
      
      <div className="login-card">
        {/* SISI KIRI: BRANDING (NAVY BLUE) */}
        <div className="login-brand d-none d-md-flex">
          <i className="bi-tsunami mb-3" style={{ fontSize: '4.5rem', opacity: '0.9' }}></i>
          <h2 className="fw-bolder mb-2" style={{ letterSpacing: '2px' }}>SIDAPUT</h2>
          <p className="mb-0" style={{ color: '#93c5fd', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Sistem Informasi Data Perikanan Tangkap<br/>
            Dinas Perikanan dan Kelautan
          </p>
          
          <div className="mt-5 pt-5 w-100" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="small mb-0" style={{ color: '#94a3b8' }}>&copy; {new Date().getFullYear()} Hak Cipta Dilindungi</p>
          </div>
        </div>

        {/* SISI KANAN: FORM LOGIN */}
        <div className="login-form-container bg-white">
          <div className="mb-4 pb-2">
            <h4 className="fw-bold text-navy mb-1">Otentikasi Sistem</h4>
            <p className="text-slate small">Silakan masuk menggunakan kredensial resmi Anda.</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small fw-semibold border-0" style={{ backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px' }}>
              <i className="bi-exclamation-circle me-2"></i>{error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label text-slate small fw-bold">Nama Pengguna (NIP/Username)</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-slate border-end-0" style={{ borderRadius: '4px 0 0 4px' }}>
                  <i className="bi-person-fill"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control border-start-0" 
                  required 
                  autoFocus
                  placeholder="Masukkan nama pengguna"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ borderRadius: '0 4px 4px 0' }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label text-slate small fw-bold">Kata Sandi Akses</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-slate border-end-0" style={{ borderRadius: '4px 0 0 4px' }}>
                  <i className="bi-shield-lock-fill"></i>
                </span>
                <input 
                  type="password" 
                  className="form-control border-start-0" 
                  required 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ borderRadius: '0 4px 4px 0' }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-navy w-100 shadow-sm mt-2">
              {loading ? (
                <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Memverifikasi...</span>
              ) : (
                <span><i className="bi-box-arrow-in-right me-2"></i>LOGIN</span>
              )}
            </button>
          </form>

          <div className="text-center mt-4 pt-4 border-top">
            <p className="small text-slate mb-0">Lupa kata sandi? Hubungi Administrator IT Anda.</p>
          </div>
        </div>
      </div>
    </div>
  );
}