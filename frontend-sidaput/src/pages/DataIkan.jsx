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

export default function DataIkan() {
  const [ikan, setIkan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kataKunci, setKataKunci] = useState('');

  const [showModalTambah, setShowModalTambah] = useState(false);
  const [formTambah, setFormTambah] = useState({ nama_ikan: '', harga: '' });

  const [showModalHarga, setShowModalHarga] = useState(false);
  const [ikanTerpilih, setIkanTerpilih] = useState(null); 
  const [hargaBaru, setHargaBaru] = useState('');

  const [proses, setProses] = useState(false);

  const ambilData = () => {
    setLoading(true);
    axios.get('http://127.0.0.1:8000/api/ikan')
      .then((res) => { setIkan(res.data.data); setLoading(false); })
      .catch((err) => console.error("Gagal narik data ikan:", err));
  };

  useEffect(() => { ambilData(); }, []);

  const simpanIkanBaru = (e) => {
    e.preventDefault();
    setProses(true);
    axios.post('http://127.0.0.1:8000/api/ikan', formTambah)
      .then((res) => {
        alert("Sistem: " + res.data.pesan);
        setShowModalTambah(false);
        setFormTambah({ nama_ikan: '', harga: '' });
        ambilData();
      })
      .catch((err) => alert("Sistem: Gagal menambah komoditas ikan."))
      .finally(() => setProses(false));
  };

  const simpanHargaBaru = (e) => {
    e.preventDefault();
    setProses(true);
    axios.post(`http://127.0.0.1:8000/api/ikan/${ikanTerpilih.id}/harga`, { harga: hargaBaru })
      .then((res) => {
        alert("Sistem: " + res.data.pesan);
        setShowModalHarga(false);
        setHargaBaru('');
        ambilData();
      })
      .catch((err) => alert("Sistem: Gagal memperbarui harga komoditas."))
      .finally(() => setProses(false));
  };

  const hapusIkan = (id) => {
    if (window.confirm("Peringatan: Anda yakin ingin menghapus data komoditas ini secara permanen?")) {
      axios.delete(`http://127.0.0.1:8000/api/ikan/${id}`)
        .then((res) => { alert("Sistem: " + res.data.pesan); ambilData(); })
        .catch((err) => alert("Sistem: Penghapusan ditolak. Data komoditas ini terkait dengan dokumen transaksi."));
    }
  };

  const dataTampil = ikan.filter(item => 
    item.nama.toLowerCase().includes(kataKunci.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '2rem' }}>
      <style>{styleCSS}</style>

      {/* HEADER FORMAL */}
      <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
        <div>
            <h3 className="fw-bold m-0 text-navy" style={{ letterSpacing: '-0.5px' }}>REFERENSI KOMODITAS IKAN</h3>
            <p className="text-slate m-0" style={{ fontSize: '0.9rem' }}>Manajemen daftar komoditas dan historis harga patokan pasar</p>
        </div>
        <button onClick={() => setShowModalTambah(true)} className="btn btn-navy shadow-sm px-4 py-2">
          <i className="bi-plus-lg me-2"></i>Entri Komoditas Baru
        </button>
      </div>

      {/* CARD TABEL & PENCARIAN */}
      <div className="card-formal overflow-hidden">
        <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
            <h6 className="m-0 fw-bold text-navy" style={{ fontSize: '0.85rem' }}>INDEKS KOMODITAS DAN HARGA</h6>
            <div className="input-group" style={{width: '280px'}}>
                <span className="input-group-text bg-white text-slate border-end-0" style={{ borderRadius: '4px 0 0 4px' }}><i className="bi-search"></i></span>
                <input type="text" className="form-control border-start-0" placeholder="Pencarian komoditas..." value={kataKunci} onChange={(e) => setKataKunci(e.target.value)} style={{ borderRadius: '0 4px 4px 0', backgroundColor: '#ffffff' }}/>
            </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-formal mb-0">
              <thead>
                <tr>
                  <th className="px-4 py-3" style={{width:'5%'}}>No</th>
                  <th className="w-25">Nama Komoditas</th>
                  <th>Harga Patokan (Terkini)</th>
                  <th>Siklus Pembaruan</th>
                  <th className="text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-5 text-slate">Memuat instrumen data... ⏳</td></tr>
                ) : dataTampil.length > 0 ? (
                  dataTampil.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-slate">{index + 1}</td>
                      <td className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                        <i className="bi-bookmark-dash text-slate me-2 opacity-50"></i> {item.nama}
                      </td>
                      <td>
                        <span className="fw-bold" style={{ color: '#047857' }}>
                          {item.harga ? `Rp ${Number(item.harga).toLocaleString('id-ID')} / Kg` : 'Belum ditetapkan'}
                        </span>
                      </td>
                      <td className="text-slate">
                        <i className="bi-clock-history me-1 opacity-50"></i> 
                        {item.update ? new Date(item.update).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'}) : '-'}
                      </td>
                      {/* === BAGIAN INI YANG DIPERBAIKI === */}
                      <td className="text-center">
                        <button 
                          onClick={() => { setIkanTerpilih(item); setShowModalHarga(true); }} 
                          className="btn btn-sm btn-outline-slate me-2 mb-1" title="Perbarui Harga Patokan"
                        >
                          <i className="bi-currency-dollar me-1"></i> Perbarui Harga
                        </button>
                        <button onClick={() => hapusIkan(item.id)} className="btn btn-sm btn-outline-slate text-danger mb-1" title="Hapus Permanen">
                          <i className="bi-trash3 me-1"></i> Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="text-center py-5 text-slate">Data komoditas tidak ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= MODAL 1: TAMBAH IKAN BARU ================= */}
      {showModalTambah && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center modal-overlay" style={{ zIndex: 1050 }}>
          <div className="card-formal" style={{width: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'}}>
            <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
              <h6 className="fw-bold m-0 text-navy">ENTRI KOMODITAS BARU</h6>
              <button onClick={() => setShowModalTambah(false)} className="btn-close" style={{ fontSize: '0.8rem' }}></button>
            </div>
            <div className="card-body p-4">
              <form onSubmit={simpanIkanBaru}>
                <div className="mb-3">
                  <label className="form-label text-slate small fw-bold">Nama Komoditas Ikan</label>
                  <input type="text" className="form-control" required placeholder="Cth: Tenggiri"
                    value={formTambah.nama_ikan} onChange={(e) => setFormTambah({...formTambah, nama_ikan: e.target.value})}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label text-slate small fw-bold">Penetapan Harga Awal per Kg (Rp)</label>
                  <input type="number" className="form-control" required placeholder="Cth: 50000"
                    value={formTambah.harga} onChange={(e) => setFormTambah({...formTambah, harga: e.target.value})}
                  />
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

      {/* ================= MODAL 2: UPDATE HARGA ================= */}
      {showModalHarga && ikanTerpilih && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center modal-overlay" style={{ zIndex: 1050 }}>
          <div className="card-formal" style={{width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'}}>
            <div className="card-body p-4 text-center">
              <div className="rounded-circle bg-light border text-navy mx-auto d-flex align-items-center justify-content-center mb-3" style={{width:'60px', height:'60px'}}>
                <i className="bi-graph-up-arrow fs-3"></i>
              </div>
              <h6 className="fw-bold text-dark mb-1">Pembaruan Harga Patokan</h6>
              <p className="text-slate small mb-4">Silakan masukkan ekuivalen harga terbaru untuk komoditas <strong className="text-navy">{ikanTerpilih.nama}</strong></p>
              
              <form onSubmit={simpanHargaBaru}>
                <div className="input-group mb-4">
                  <span className="input-group-text bg-light text-slate fw-bold" style={{ borderRadius: '4px 0 0 4px', borderRight: 'none' }}>Rp</span>
                  <input type="number" className="form-control form-control-lg border-start-0" required autoFocus placeholder="0"
                    value={hargaBaru} onChange={(e) => setHargaBaru(e.target.value)} style={{ borderRadius: '0 4px 4px 0' }}
                  />
                </div>
                <div className="d-flex gap-2">
                  <button type="button" onClick={() => setShowModalHarga(false)} className="btn btn-outline-slate w-50 py-2">Batal</button>
                  <button type="submit" disabled={proses} className="btn btn-navy w-50 py-2">{proses ? 'Memproses...' : 'Terapkan Harga'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}