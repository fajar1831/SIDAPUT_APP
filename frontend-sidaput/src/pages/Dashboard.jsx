import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';

// CSS Formal (Garis tegas, shadow elegan, warna korporat)
const styleCSS = `
  .donut-chart {
    width: 65px;
    height: 65px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .donut-inner {
    width: 50px;
    height: 50px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
  }
  .card-formal {
    box-shadow: 0 2px 4px rgba(15, 23, 42, 0.08);
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    background-color: #ffffff;
  }
  .text-navy { color: #1e3a8a; }
  .bg-navy { background-color: #1e3a8a; }
  .text-emerald { color: #047857; }
  .text-slate { color: #475569; }
`;

export default function Dashboard() {
  const [dataDash, setDataDash] = useState({
    total_kg: 0,
    total_rp: 0,
    rtp_aktif: 0,
    total_rtp: 0,
    top_ikan: [],
    tren_harian: [],
    kategori_nelayan: []
  });
  const [loading, setLoading] = useState(true);

  const tahunSekarang = String(new Date().getFullYear());

  const [filterBulan, setFilterBulan] = useState('semua');
  const [filterTahun, setFilterTahun] = useState(tahunSekarang);

  const [aktifBulan, setAktifBulan] = useState('semua');
  const [aktifTahun, setAktifTahun] = useState(tahunSekarang);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://127.0.0.1:8000/api/dashboard?bulan=${aktifBulan}&tahun=${aktifTahun}`)
      .then((res) => {
        setDataDash(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal menarik data dasbor:", err);
        setLoading(false);
      });
  }, [aktifBulan, aktifTahun]);

  const terapkanFilter = () => {
    setAktifBulan(filterBulan);
    setAktifTahun(filterTahun);
  };

  // Kalkulasi Target
  const targetPerNelayanSebulan = 50; 
  let targetProduksi = 0;
  if (dataDash.total_rtp > 0) {
    targetProduksi = aktifBulan === 'semua' 
      ? (dataDash.total_rtp * targetPerNelayanSebulan * 12) 
      : (dataDash.total_rtp * targetPerNelayanSebulan);
  }

  const persenTarget = (dataDash.total_kg > 0 && targetProduksi > 0) 
    ? Math.round((dataDash.total_kg / targetProduksi) * 100) : 0;
  
  const persenRTP = dataDash.total_rtp > 0 
    ? Math.round((dataDash.rtp_aktif / dataDash.total_rtp) * 100) : 0;

  const nelayanPenuhData = dataDash.kategori_nelayan.find(k => k.nama_kategori.toLowerCase().includes('penuh'));
  const jumlahPenuh = nelayanPenuhData ? nelayanPenuhData.jumlah : 0;
  const persenKategori = dataDash.total_rtp > 0 
    ? Math.round((jumlahPenuh / dataDash.total_rtp) * 100) : 0;

  if (loading && dataDash.total_kg === 0) {
    return <div className="d-flex justify-content-center align-items-center vh-100 text-navy"><h5>Memuat Dokumen Dasbor... ⏳</h5></div>;
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '2rem' }}>
      <style>{styleCSS}</style>
      
      {/* ================= HEADER FORMAL ================= */}
      <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
        <div>
          <h3 className="fw-bold m-0 text-navy" style={{ letterSpacing: '-0.5px' }}>DASBOR REKAPITULASI PRODUKSI</h3>
          <p className="text-slate m-0" style={{ fontSize: '0.9rem' }}>Sistem Informasi Data Perikanan Tangkap (SIDAPUT)</p>
        </div>
        
        <div className="d-flex align-items-center gap-2">
            <span className="text-slate small fw-semibold me-1"><i className="bi-funnel me-1"></i>Periode:</span>
            <select className="form-select form-select-sm border" value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)} style={{width: '140px', borderRadius: '4px'}}>
                <option value="semua">Tahun Penuh</option>
                <option value="01">Januari</option>
                <option value="02">Februari</option>
                <option value="03">Maret</option>
                <option value="04">April</option>
            </select>
            <select className="form-select form-select-sm border" value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)} style={{width: '90px', borderRadius: '4px'}}>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
            </select>
            <button onClick={terapkanFilter} className="btn btn-sm text-white px-3 fw-semibold" style={{ backgroundColor: '#1e3a8a', borderRadius: '4px' }}>
                Terapkan
            </button>
        </div>
      </div>

      {loading && <div className="alert alert-secondary py-2 small fw-semibold rounded-1 border-0">Memperbarui instrumen data... ⏳</div>}

      {/* ================= BARIS 1: INDIKATOR KINERJA UTAMA (KPI) ================= */}
      <div className="row g-3 mb-4">
        {/* KPI 1: Realisasi Target (Emerald Green) */}
        <div className="col-md-3">
          <div className="card-formal h-100 p-3 d-flex flex-row align-items-center">
            <div className="donut-chart me-3" style={{background: `conic-gradient(#059669 ${persenTarget > 100 ? 100 : persenTarget}%, #e2e8f0 0)`}}>
              <div className="donut-inner text-emerald">{persenTarget}%</div>
            </div>
            <div>
              <p className="text-slate m-0" style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Realisasi Volume</p>
              <h4 className="fw-bold m-0" style={{ color: '#0f172a' }}>{dataDash.total_kg} <span className="fs-6 fw-normal text-secondary">Kg</span></h4>
              <p className="text-muted m-0" style={{ fontSize: '0.75rem' }}>Target: {targetProduksi.toLocaleString('id-ID')} Kg</p>
            </div>
          </div>
        </div>

        {/* KPI 2: RTP Aktif (Navy Blue) */}
        <div className="col-md-3">
          <div className="card-formal h-100 p-3 d-flex flex-row align-items-center">
            <div className="donut-chart me-3" style={{background: `conic-gradient(#1e3a8a ${persenRTP}%, #e2e8f0 0)`}}>
              <div className="donut-inner text-navy">{persenRTP}%</div>
            </div>
            <div>
              <p className="text-slate m-0" style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Partisipasi RTP</p>
              <h4 className="fw-bold m-0" style={{ color: '#0f172a' }}>{dataDash.rtp_aktif} <span className="fs-6 fw-normal text-secondary">Unit</span></h4>
              <p className="text-muted m-0" style={{ fontSize: '0.75rem' }}>Aktif pada periode ini</p>
            </div>
          </div>
        </div>

        {/* KPI 3: Nelayan Utama (Slate/Gray) */}
        <div className="col-md-3">
          <div className="card-formal h-100 p-3 d-flex flex-row align-items-center">
            <div className="donut-chart me-3" style={{background: `conic-gradient(#475569 ${persenKategori}%, #e2e8f0 0)`}}>
              <div className="donut-inner text-slate">{persenKategori}%</div>
            </div>
            <div>
              <p className="text-slate m-0" style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Nelayan Penuh</p>
              <h4 className="fw-bold m-0" style={{ color: '#0f172a' }}>{dataDash.total_rtp} <span className="fs-6 fw-normal text-secondary">Total</span></h4>
              <p className="text-muted m-0" style={{ fontSize: '0.75rem' }}>Mayoritas: {jumlahPenuh} Orang</p>
            </div>
          </div>
        </div>

        {/* KPI 4: Komoditas Dominan */}
        <div className="col-md-3">
          <div className="card-formal h-100 p-3">
            <p className="text-slate mb-2" style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Komoditas Dominan</p>
            <div className="w-100 mt-1">
              {dataDash.top_ikan.length > 0 ? dataDash.top_ikan.map((ikan, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-2 w-100 border-bottom pb-1">
                  <span className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>{index + 1}. {ikan.nama_ikan}</span>
                  <span className="fw-bold text-navy" style={{ fontSize: '0.85rem' }}>
                    {Number(ikan.total_kg).toLocaleString('id-ID')} Kg
                  </span>
                </div>
              )) : (
                <span className="small text-muted">Data belum tersedia</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= BARIS 2: PANEL DATA UTAMA ================= */}
      <div className="row g-3">
        {/* Kiri: Ringkasan Nilai Ekonomi */}
        <div className="col-md-4">
          <div className="card-formal h-100 p-4 d-flex flex-column justify-content-between">
            <div>
              <p className="text-slate mb-1" style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>
                <i className="bi-cash-coin me-2"></i>Estimasi Nilai Produksi
              </p>
              <h2 className="fw-bolder text-emerald mt-2 mb-1" style={{ letterSpacing: '-1px' }}>
                Rp {dataDash.total_rp.toLocaleString('id-ID')}
              </h2>
              <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                Taksiran nilai tukar ekonomi dari total volume tangkapan sebesar <strong className="text-dark">{dataDash.total_kg} Kg</strong>.
              </p>
            </div>
            
            <div className="d-flex flex-column gap-2 mt-4 pt-4 border-top">
              <Link to="/input-harian" className="btn text-white fw-semibold" style={{ backgroundColor: '#1e3a8a', borderRadius: '4px' }}>
                <i className="bi-pencil-square me-2"></i>Entri Data Produksi
              </Link>
              <Link to="/laporan" className="btn bg-light border fw-semibold text-slate" style={{ borderRadius: '4px' }}>
                <i className="bi-file-earmark-text me-2"></i>Dokumen Laporan
              </Link>
            </div>
          </div>
        </div>

        {/* Kanan: Grafik Tren Visual */}
        <div className="col-md-8">
          <div className="card-formal h-100 p-4">
            <div className="mb-4">
              <h6 className="fw-bold m-0" style={{color: '#0f172a'}}>TREN VOLUME PRODUKSI (Kg)</h6>
              <p className="text-muted m-0" style={{ fontSize: '0.8rem' }}>
                {aktifBulan === 'semua' 
                  ? 'Rekapitulasi total tangkapan per bulan pada tahun berjalan' 
                  : 'Distribusi hasil tangkapan per hari pada bulan berjalan'}
              </p>
            </div>
            
            <div style={{ width: '100%', height: '230px', minHeight: '230px' }}>
              {dataDash.tren_harian.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataDash.tren_harian} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="tanggal" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} dy={10} />
                    <Tooltip 
                      contentStyle={{borderRadius: '4px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '0.85rem'}}
                      labelStyle={{fontWeight: 'bold', color: '#0f172a'}}
                      formatter={(value) => [`${value} Kg`, 'Volume']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="kg" 
                      stroke="#1e3a8a" 
                      strokeWidth={3} 
                      dot={{r: 4, fill: '#ffffff', strokeWidth: 2, stroke: '#1e3a8a'}} 
                      activeDot={{r: 6, fill: '#1e3a8a'}} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100 text-muted bg-light border" style={{ borderRadius: '4px' }}>
                  <span style={{ fontSize: '0.85rem' }}><i className="bi-info-circle me-2"></i>Belum ada rekaman data pada periode ini.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}