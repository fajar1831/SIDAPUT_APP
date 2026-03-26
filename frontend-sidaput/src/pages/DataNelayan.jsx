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
  .form-control, .form-select { border-radius: 4px; border: 1px solid #cbd5e1; }
  .form-control:focus, .form-select:focus { border-color: #1e3a8a; box-shadow: 0 0 0 0.2rem rgba(30, 58, 138, 0.25); }
  .modal-overlay { background-color: rgba(15, 23, 42, 0.75); backdrop-filter: blur(2px); }
`;

export default function DataNelayan() {
  const [nelayan, setNelayan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kataKunci, setKataKunci] = useState('');

  const [opsiDesa, setOpsiDesa] = useState([]);
  const [opsiKategori, setOpsiKategori] = useState([]);
  const [opsiPerairan, setOpsiPerairan] = useState([]);
  const [opsiKapal, setOpsiKapal] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [idEdit, setIdEdit] = useState(null);
  
  const [form, setForm] = useState({
    nama: '', alamat: '', id_desa: '', id_kategori: '', id_perairan: '', id_kapal: ''
  });

  const [proses, setProses] = useState(false);

  const ambilData = () => {
    setLoading(true);
    axios.get('http://127.0.0.1:8000/api/nelayan')
      .then(res => { setNelayan(res.data.data); setLoading(false); })
      .catch(err => console.error(err));
    
    axios.get('http://127.0.0.1:8000/api/nelayan-options')
      .then(res => {
        setOpsiDesa(res.data.desa);
        setOpsiKategori(res.data.kategori);
        setOpsiPerairan(res.data.perairan);
        setOpsiKapal(res.data.kapal);
      }).catch(err => console.error(err));
  };

  useEffect(() => { ambilData(); }, []);

  const bukaModalTambah = () => {
    setIsEdit(false);
    setForm({ 
      nama: '', alamat: '', 
      id_desa: opsiDesa[0]?.id_desa || '', 
      id_kategori: opsiKategori[0]?.id_kat_nelayan || '',
      id_perairan: opsiPerairan[0]?.id_perairan || '',
      id_kapal: opsiKapal[0]?.id_kapal || ''
    });
    setShowModal(true);
  };

  const bukaModalEdit = (item) => {
    setIsEdit(true);
    setIdEdit(item.id);
    setForm({ 
      nama: item.nama, alamat: item.alamat, id_desa: item.id_desa, 
      id_kategori: item.id_kat_nelayan, id_perairan: item.id_perairan || '', id_kapal: item.id_kapal || ''
    });
    setShowModal(true);
  };

  const simpanData = (e) => {
    e.preventDefault();
    setProses(true);
    const url = isEdit ? `http://127.0.0.1:8000/api/nelayan/${idEdit}` : 'http://127.0.0.1:8000/api/nelayan';
    const method = isEdit ? 'put' : 'post';

    axios[method](url, form)
      .then((res) => {
        alert("Sistem: " + res.data.pesan);
        setShowModal(false);
        ambilData();
      })
      .catch((err) => alert("Sistem: Gagal merekam data ke server."))
      .finally(() => setProses(false));
  };

  const hapusData = (id) => {
    if (window.confirm("Peringatan: Anda yakin ingin menghapus data nelayan ini secara permanen?")) {
      axios.delete(`http://127.0.0.1:8000/api/nelayan/${id}`)
        .then((res) => { alert("Sistem: " + res.data.pesan); ambilData(); })
        .catch((err) => alert("Sistem: Gagal menghapus. Data mungkin sedang terelasi dengan dokumen transaksi."));
    }
  };

  const dataTampil = nelayan.filter(item => 
    item.nama.toLowerCase().includes(kataKunci.toLowerCase()) ||
    item.alamat.toLowerCase().includes(kataKunci.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '2rem' }}>
      <style>{styleCSS}</style>

      {/* HEADER FORMAL */}
      <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
        <div>
            <h3 className="fw-bold m-0 text-navy" style={{ letterSpacing: '-0.5px' }}>DIREKTORI DATA NELAYAN</h3>
            <p className="text-slate m-0" style={{ fontSize: '0.9rem' }}>Manajemen basis data Rumah Tangga Perikanan (RTP)</p>
        </div>
        <button onClick={bukaModalTambah} className="btn btn-navy shadow-sm px-4 py-2">
          <i className="bi-plus-lg me-2"></i>Registrasi Nelayan
        </button>
      </div>

      {/* CARD TABEL & PENCARIAN */}
      <div className="card-formal overflow-hidden">
        <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
            <h6 className="m-0 fw-bold text-navy" style={{ fontSize: '0.85rem' }}>INDEKS NELAYAN TERDAFTAR</h6>
            <div className="input-group" style={{width: '300px'}}>
                <span className="input-group-text bg-white text-slate border-end-0" style={{ borderRadius: '4px 0 0 4px' }}><i className="bi-search"></i></span>
                <input type="text" className="form-control border-start-0" placeholder="Pencarian nama / alamat..." value={kataKunci} onChange={(e) => setKataKunci(e.target.value)} style={{ borderRadius: '0 4px 4px 0', backgroundColor: '#ffffff' }} />
            </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-formal mb-0">
              <thead>
                <tr>
                  <th className="px-4 py-3">Identitas Nelayan</th>
                  <th>Wilayah Desa</th>
                  <th>Klasifikasi Armada</th>
                  <th>Kategori</th>
                  <th className="text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-5 text-slate">Memuat instrumen data... ⏳</td></tr>
                ) : dataTampil.length > 0 ? (
                  dataTampil.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{item.nama}</div>
                        <div className="text-slate" style={{ fontSize: '0.75rem' }}>{item.alamat}</div>
                      </td>
                      <td><span className="fw-semibold text-dark"><i className="bi-pin-map text-slate me-1"></i>{item.desa}</span></td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <span className="fw-semibold text-navy" style={{ fontSize: '0.75rem' }}><i className="bi-water me-1"></i>{item.perairan || 'Belum diatur'}</span>
                          <span className="text-slate" style={{ fontSize: '0.75rem' }}><i className="bi-ship me-1"></i>{item.kapal || 'Belum diatur'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light border text-dark" style={{ fontSize: '0.7rem' }}>
                          {item.kategori}
                        </span>
                      </td>
                      {/* === BAGIAN INI YANG DIPERBAIKI (TOMBOL ADA TEKSNYA) === */}
                      <td className="text-center">
                        <button onClick={() => bukaModalEdit(item)} className="btn btn-sm btn-outline-slate me-2 mb-1" title="Ubah Data">
                          <i className="bi-pencil-square me-1"></i>Ubah
                        </button>
                        <button onClick={() => hapusData(item.id)} className="btn btn-sm btn-outline-slate text-danger mb-1" title="Hapus Permanen">
                          <i className="bi-trash3 me-1"></i>Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="text-center py-5 text-slate">Arsip nelayan tidak ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= MODAL FORM (FORMAL) ================= */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center modal-overlay" style={{ zIndex: 1050 }}>
          <div className="card-formal" style={{width: '600px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'}}>
            <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
              <h6 className="fw-bold m-0 text-navy">{isEdit ? 'UBAH DATA NELAYAN' : 'REGISTRASI NELAYAN BARU'}</h6>
              <button onClick={() => setShowModal(false)} className="btn-close" style={{ fontSize: '0.8rem' }}></button>
            </div>
            <div className="card-body p-4">
              <form onSubmit={simpanData}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label text-slate small fw-bold">Nama Lengkap Sesuai KTP</label>
                    <input type="text" className="form-control" required value={form.nama} onChange={(e) => setForm({...form, nama: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-slate small fw-bold">Alamat (Dusun/RT/RW)</label>
                    <input type="text" className="form-control" required value={form.alamat} onChange={(e) => setForm({...form, alamat: e.target.value})} />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label text-slate small fw-bold">Wilayah Desa</label>
                    <select className="form-select" required value={form.id_desa} onChange={(e) => setForm({...form, id_desa: e.target.value})}>
                      <option value="">-- Pilih Wilayah --</option>
                      {opsiDesa.map(d => <option key={d.id_desa} value={d.id_desa}>{d.nama_desa}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-slate small fw-bold">Kategori Nelayan</label>
                    <select className="form-select" required value={form.id_kategori} onChange={(e) => setForm({...form, id_kategori: e.target.value})}>
                      <option value="">-- Pilih Klasifikasi --</option>
                      {opsiKategori.map(k => <option key={k.id_kat_nelayan} value={k.id_kat_nelayan}>{k.nama_kategori}</option>)}
                    </select>
                  </div>
                </div>

                <div className="row mb-4 pb-3 border-bottom">
                  <div className="col-md-6">
                    <label className="form-label text-slate small fw-bold">Jenis Perairan</label>
                    <select className="form-select" required value={form.id_perairan} onChange={(e) => setForm({...form, id_perairan: e.target.value})}>
                      <option value="">-- Tetapkan Perairan --</option>
                      {opsiPerairan.map(p => <option key={p.id_perairan} value={p.id_perairan}>{p.nama_perairan}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-slate small fw-bold">Armada / Kapal</label>
                    <select className="form-select" required value={form.id_kapal} onChange={(e) => setForm({...form, id_kapal: e.target.value})}>
                      <option value="">-- Tetapkan Armada --</option>
                      {opsiKapal.map(k => <option key={k.id_kapal} value={k.id_kapal}>{k.nama_kapal}</option>)}
                    </select>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline-slate px-4 py-2">Batal</button>
                  <button type="submit" disabled={proses} className="btn btn-navy px-4 py-2">
                    {proses ? 'Menyimpan Dokumen...' : 'Simpan Dokumen'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}