import React, { useState, useEffect } from 'react';
import axios from 'axios';

// CSS Tema Pemerintahan / Formal
const styleCSS = `
  .card-formal { box-shadow: 0 2px 4px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0; border-radius: 4px; background-color: #ffffff; }
  .text-navy { color: #1e3a8a; }
  .bg-navy { background-color: #1e3a8a; color: white; }
  .btn-navy { background-color: #1e3a8a; color: white; border-radius: 4px; font-weight: 600; }
  .btn-navy:hover { background-color: #172554; color: white; }
  .btn-outline-navy { border: 1px solid #1e3a8a; color: #1e3a8a; border-radius: 4px; font-weight: 600; background: transparent; }
  .btn-outline-navy:hover { background-color: #f1f5f9; }
  .text-slate { color: #475569; }
  .form-control, .form-select { border-radius: 4px; border: 1px solid #cbd5e1; }
  .form-control:focus, .form-select:focus { border-color: #1e3a8a; box-shadow: 0 0 0 0.2rem rgba(30, 58, 138, 0.25); }
`;

export default function TransaksiHarian() {
  const [opsiNelayan, setOpsiNelayan] = useState([]);
  const [opsiIkan, setOpsiIkan] = useState([]);
  const [opsiAlat, setOpsiAlat] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tanggalTrip, setTanggalTrip] = useState(new Date().toISOString().split('T')[0]);
  const [idNelayan, setIdNelayan] = useState('');
  
  const [tangkapan, setTangkapan] = useState([
    { id_ikan: '', id_alat: '', volume_kg: '', nilai_rp: '' }
  ]);
  const [proses, setProses] = useState(false);

  useEffect(() => {
    ambilDataHistory();
    axios.get('http://127.0.0.1:8000/api/transaksi-options')
      .then(res => {
        setOpsiNelayan(res.data.nelayan);
        setOpsiIkan(res.data.ikan);
        setOpsiAlat(res.data.alat);
      }).catch(err => console.error(err));
  }, []);

  const ambilDataHistory = () => {
    setLoading(true);
    axios.get('http://127.0.0.1:8000/api/transaksi')
      .then(res => { setHistory(res.data.data); setLoading(false); })
      .catch(err => console.error(err));
  };

  const tambahBarisIkan = () => {
    setTangkapan([...tangkapan, { id_ikan: '', id_alat: '', volume_kg: '', nilai_rp: '' }]);
  };

  const hapusBarisIkan = (index) => {
    const dataBaru = [...tangkapan];
    dataBaru.splice(index, 1);
    setTangkapan(dataBaru);
  };

  const ubahDataIkan = (index, field, value) => {
    const dataBaru = [...tangkapan];
    dataBaru[index][field] = value;

    if (field === 'id_ikan' || field === 'volume_kg') {
      const idIkanTerpilih = dataBaru[index].id_ikan;
      const volume = parseFloat(dataBaru[index].volume_kg) || 0;
      const ikanMatch = opsiIkan.find(i => i.id == idIkanTerpilih);
      const hargaPerKg = ikanMatch && ikanMatch.harga ? parseFloat(ikanMatch.harga) : 0;
      dataBaru[index].nilai_rp = volume * hargaPerKg;
    }
    setTangkapan(dataBaru);
  };

  const simpanTransaksi = (e) => {
    e.preventDefault();
    if (!idNelayan) return alert("Mohon pilih identitas nelayan terlebih dahulu.");
    
    const isLengkap = tangkapan.every(t => t.id_ikan && t.id_alat && t.volume_kg);
    if (!isLengkap) return alert("Pastikan seluruh baris komoditas telah diisi dengan lengkap.");

    setProses(true);
    axios.post('http://127.0.0.1:8000/api/transaksi', {
      id_responden: idNelayan,
      tanggal_trip: tanggalTrip,
      tangkapan: tangkapan 
    })
    .then(res => {
      alert("Sistem: Data produksi berhasil direkam ke dalam basis data.");
      setIdNelayan('');
      setTangkapan([{ id_ikan: '', id_alat: '', volume_kg: '', nilai_rp: '' }]);
      ambilDataHistory(); 
    })
    .catch(err => alert("Sistem: Terjadi kesalahan saat menyimpan data."))
    .finally(() => setProses(false));
  };

  const totalRupiahForm = tangkapan.reduce((sum, item) => sum + Number(item.nilai_rp || 0), 0);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '2rem' }}>
      <style>{styleCSS}</style>
      
      {/* HEADER FORMAL */}
      <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
        <div>
            <h3 className="fw-bold m-0 text-navy" style={{ letterSpacing: '-0.5px' }}>ENTRI DATA PRODUKSI HARIAN</h3>
            <p className="text-slate m-0" style={{ fontSize: '0.9rem' }}>Formulir pencatatan hasil tangkapan nelayan per aktivitas melaut (Form 2)</p>
        </div>
      </div>

      <div className="row g-4">
        {/* KOLOM KIRI: FORM */}
        <div className="col-lg-8">
          <div className="card-formal">
            <div className="p-4 border-bottom bg-light">
              <h6 className="fw-bold m-0 text-navy"><i className="bi-pencil-square me-2"></i>FORMULIR CATATAN MELAUT</h6>
            </div>
            <div className="card-body p-4">
              <form onSubmit={simpanTransaksi}>
                
                {/* DATA INDUK */}
                <div className="row mb-4 p-3 rounded-1 border" style={{ backgroundColor: '#f1f5f9' }}>
                  <div className="col-md-6">
                    <label className="form-label text-slate small fw-bold">Tanggal Trip / Melaut</label>
                    <input type="date" className="form-control" required value={tanggalTrip} onChange={(e) => setTanggalTrip(e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-slate small fw-bold">Identitas Nelayan (RTP)</label>
                    <select className="form-select" required value={idNelayan} onChange={(e) => setIdNelayan(e.target.value)}>
                      <option value="">-- Pilih Nelayan Terdaftar --</option>
                      {opsiNelayan.map(n => <option key={n.id} value={n.id}>{n.nama}</option>)}
                    </select>
                  </div>
                </div>

                {/* DATA RINCIAN */}
                <div className="d-flex justify-content-between align-items-center mb-3 mt-4 border-bottom pb-2">
                  <h6 className="fw-bold text-dark m-0">RINCIAN KOMODITAS TANGKAPAN</h6>
                  <button type="button" onClick={tambahBarisIkan} className="btn btn-sm btn-outline-navy">
                    <i className="bi-plus-lg me-1"></i> Tambah Baris Komoditas
                  </button>
                </div>

                {tangkapan.map((item, index) => {
                  const ikanYgDipilih = opsiIkan.find(i => i.id == item.id_ikan);
                  const hargaPerKg = ikanYgDipilih && ikanYgDipilih.harga ? Number(ikanYgDipilih.harga) : 0;
                  const teksHargaPasar = hargaPerKg > 0 ? `Rp ${hargaPerKg.toLocaleString('id-ID')}` : '';

                  return (
                    <div key={index} className="row g-2 mb-3 align-items-end p-3 border rounded-1 position-relative" style={{ backgroundColor: '#ffffff' }}>
                      {tangkapan.length > 1 && (
                        <button type="button" onClick={() => hapusBarisIkan(index)} className="btn btn-sm btn-danger position-absolute" style={{top: '-10px', right: '-10px', width: '25px', height: '25px', padding: 0, borderRadius: '4px'}}>
                          <i className="bi-x-lg"></i>
                        </button>
                      )}
                      
                      <div className="col-md-3">
                        <label className="form-label small text-slate fw-semibold mb-1">Komoditas Ikan</label>
                        <select className="form-select form-select-sm" required value={item.id_ikan} onChange={(e) => ubahDataIkan(index, 'id_ikan', e.target.value)}>
                          <option value="">-- Pilih --</option>
                          {opsiIkan.map(i => <option key={i.id} value={i.id}>{i.nama}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small text-slate fw-semibold mb-1">Instrumen Tangkap</label>
                        <select className="form-select form-select-sm" required value={item.id_alat} onChange={(e) => ubahDataIkan(index, 'id_alat', e.target.value)}>
                          <option value="">-- Pilih --</option>
                          {opsiAlat.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small text-slate fw-semibold mb-1">Volume (Kg)</label>
                        <input type="number" step="0.01" min="0.1" className="form-control form-control-sm" required placeholder="0.00" value={item.volume_kg} onChange={(e) => ubahDataIkan(index, 'volume_kg', e.target.value)} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small text-slate fw-semibold mb-1">Harga Patokan (Rp)</label>
                        <input type="text" className="form-control form-control-sm bg-light text-navy fw-bold" readOnly placeholder="Otomatis" value={teksHargaPasar} />
                      </div>
                    </div>
                  );
                })}

                {/* FOOTER FORM */}
                <div className="d-flex justify-content-between align-items-center mt-5 pt-3 border-top">
                  <div className="text-slate small fw-semibold">
                    Estimasi Total Nilai Produksi:<br/>
                    <strong className="fs-5 text-dark" style={{ color: '#047857' }}>Rp {totalRupiahForm.toLocaleString('id-ID')}</strong>
                  </div>
                  <button type="submit" disabled={proses} className="btn btn-navy px-5 py-2 shadow-sm">
                    {proses ? 'Merekam Data...' : 'SIMPAN DOKUMEN'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: HISTORY */}
        <div className="col-lg-4">
          <div className="card-formal h-100">
            <div className="p-4 border-bottom bg-light">
              <h6 className="fw-bold m-0 text-navy">RIWAYAT ENTRI TERAKHIR</h6>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                {loading ? (
                  <li className="list-group-item py-4 text-center text-slate border-0">Memuat data... ⏳</li>
                ) : history.length > 0 ? (
                  history.map((h, i) => (
                    <li key={i} className="list-group-item p-3 border-bottom-0 border-top d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{h.nama}</div>
                        <div className="text-slate" style={{ fontSize: '0.75rem' }}><i className="bi-calendar-check me-1"></i>{new Date(h.tanggal_trip).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})}</div>
                      </div>
                      <span className="badge bg-light border text-navy rounded-1" style={{ fontSize: '0.7rem' }}>Terekam</span>
                    </li>
                  ))
                ) : (
                  <li className="list-group-item py-4 text-center text-slate border-0">Belum ada riwayat terekam.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}