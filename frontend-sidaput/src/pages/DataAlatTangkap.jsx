import React, { useState, useEffect } from 'react';
import axios from 'axios';

// CSS Tema Pemerintahan / Formal
const styleCSS = `
  .card-formal { box-shadow: 0 2px 4px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0; border-radius: 4px; background-color: #ffffff; }
  .text-navy { color: #1e3a8a; }
  .bg-navy { background-color: #1e3a8a; color: white; }
  .btn-navy { background-color: #1e3a8a; color: white; border-radius: 4px; font-weight: 600; }
  .btn-navy:hover { background-color: #172554; color: white; }
  .btn-outline-slate { border: 1px solid #cbd5e1; color: #475569; border-radius: 4px; font-weight: 600; background: white; }
  .btn-outline-slate:hover { background-color: #f8fafc; color: #0f172a; }
  .text-slate { color: #475569; }
  .table-formal th { background-color: #1e3a8a !important; color: white !important; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; }
  .table-formal td { vertical-align: middle; font-size: 0.85rem; border-bottom: 1px solid #e2e8f0; }
  .form-control { border-radius: 4px; border: 1px solid #cbd5e1; }
  .form-control:focus { border-color: #1e3a8a; box-shadow: 0 0 0 0.2rem rgba(30, 58, 138, 0.25); }
  .modal-overlay { background-color: rgba(15, 23, 42, 0.75); backdrop-filter: blur(2px); }
`;

export default function DataAlatTangkap() {
  const [alat, setAlat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kataKunci, setKataKunci] = useState('');

  const [showModalTambah, setShowModalTambah] = useState(false);
  const [formTambah, setFormTambah] = useState({ nama_alat: '' });
  const [proses, setProses] = useState(false);

  const ambilData = () => {
    setLoading(true);
    axios.get('http://127.0.0.1:8000/api/alat-tangkap')
      .then((res) => { setAlat(res.data.data); setLoading(false); })
      .catch((err) => console.error("Gagal menarik data instrumen:", err));
  };

  useEffect(() => { ambilData(); }, []);

  const simpanAlatBaru = (e) => {
    e.preventDefault();
    setProses(true);
    axios.post('http://127.0.0.1:8000/api/alat-tangkap', formTambah)
      .then((res) => {
        alert("Sistem: " + res.data.pesan);
        setShowModalTambah(false);
        setFormTambah({ nama_alat: '' });
        ambilData();
      })
      .catch((err) => alert("Sistem: Gagal menambah instrumen tangkap."))
      .finally(() => setProses(false));
  };

  const hapusAlat = (id) => {
    if (window.confirm("Peringatan: Anda yakin ingin menghapus data instrumen ini secara permanen?")) {
      axios.delete(`http://127.0.0.1:8000/api/alat-tangkap/${id}`)
        .then((res) => { alert("Sistem: " + res.data.pesan); ambilData(); })
        .catch((err) => alert("Sistem: Penghapusan ditolak. Instrumen ini terkait dengan dokumen produksi/transaksi."));
    }
  };

  const dataTampil = alat.filter(item => 
    item.nama_alat.toLowerCase().includes(kataKunci.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '2rem' }}>
      <style>{styleCSS}</style>

      {/* HEADER FORMAL */}
      <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
        <div>
            <h3 className="fw-bold m-0 text-navy" style={{ letterSpacing: '-0.5px' }}>REFERENSI INSTRUMEN TANGKAP</h3>
            <p className="text-slate m-0" style={{ fontSize: '0.9rem' }}>Manajemen inventaris jaring, pancing, dan sarana tangkap lainnya</p>
        </div>
        <button onClick={() => setShowModalTambah(true)} className="btn btn-navy shadow-sm px-4 py-2">
          <i className="bi-plus-lg me-2"></i>Entri Instrumen Baru
        </button>
      </div>

      {/* CARD TABEL & PENCARIAN */}
      <div className="card-formal overflow-hidden">
        <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
            <h6 className="m-0 fw-bold text-navy" style={{ fontSize: '0.85rem' }}>INDEKS SARANA TANGKAP</h6>
            <div className="input-group" style={{width: '280px'}}>
                <span className="input-group-text bg-white text-slate border-end-0" style={{ borderRadius: '4px 0 0 4px' }}><i className="bi-search"></i></span>
                <input type="text" className="form-control border-start-0" placeholder="Pencarian instrumen..." value={kataKunci} onChange={(e) => setKataKunci(e.target.value)} style={{ borderRadius: '0 4px 4px 0', backgroundColor: '#ffffff' }}/>
            </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-formal mb-0">
              <thead>
                <tr>
                  <th className="px-4 py-3" style={{width:'10%'}}>No</th>
                  <th className="w-50">Klasifikasi Instrumen Tangkap</th>
                  <th className="text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="3" className="text-center py-5 text-slate">Memuat instrumen data... ⏳</td></tr>
                ) : dataTampil.length > 0 ? (
                  dataTampil.map((item, index) => (
                    <tr key={item.id_alat}>
                      <td className="px-4 py-3 text-slate fw-bold">{index + 1}</td>
                      <td className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                        <i className="bi-tools text-slate me-3 opacity-50"></i> {item.nama_alat}
                      </td>
                      <td className="text-center">
                        <button onClick={() => hapusAlat(item.id_alat)} className="btn btn-sm btn-outline-slate text-danger" title="Hapus Permanen">
                          <i className="bi-trash3"></i> Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" className="text-center py-5 text-slate">Data instrumen tangkap tidak ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= MODAL: TAMBAH ALAT BARU ================= */}
      {showModalTambah && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center modal-overlay" style={{ zIndex: 1050 }}>
          <div className="card-formal" style={{width: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'}}>
            <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
              <h6 className="fw-bold m-0 text-navy">ENTRI INSTRUMEN BARU</h6>
              <button onClick={() => setShowModalTambah(false)} className="btn-close" style={{ fontSize: '0.8rem' }}></button>
            </div>
            <div className="card-body p-4">
              <form onSubmit={simpanAlatBaru}>
                <div className="mb-4">
                  <label className="form-label text-slate small fw-bold">Nama Instrumen / Sarana Tangkap</label>
                  <input type="text" className="form-control" required placeholder="Cth: Jaring Insang (Gillnet)"
                    value={formTambah.nama_alat} onChange={(e) => setFormTambah({...formTambah, nama_alat: e.target.value})}
                  />
                  <div className="form-text mt-2 small text-muted">Gunakan penamaan baku sesuai nomenklatur statistik perikanan.</div>
                </div>
                <div className="d-flex justify-content-end gap-2 border-top pt-3">
                  <button type="button" onClick={() => setShowModalTambah(false)} className="btn btn-outline-slate px-4 py-2">Batal</button>
                  <button type="submit" disabled={proses} className="btn btn-navy px-4 py-2">{proses ? 'Memproses...' : 'Simpan Entri'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}