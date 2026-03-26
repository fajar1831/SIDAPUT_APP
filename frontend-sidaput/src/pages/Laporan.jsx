import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const styleCSS = `
  .card-formal { box-shadow: 0 2px 4px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0; border-radius: 4px; background-color: #ffffff; }
  .text-navy { color: #1e3a8a; }
  .text-slate { color: #475569; }
  .btn-navy { background-color: #1e3a8a; color: white; border-radius: 4px; font-weight: 600; }
  .btn-outline-slate { border: 1px solid #cbd5e1; color: #475569; border-radius: 4px; font-weight: 600; background: white; }
  .table-formal th { background-color: #1e3a8a !important; color: white !important; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; }
  .table-formal td { vertical-align: middle; font-size: 0.85rem; border-bottom: 1px solid #e2e8f0; }
  .form-control, .form-select { border-radius: 4px; border: 1px solid #cbd5e1; }
`;

export default function Laporan() {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [opsiDesa, setOpsiDesa] = useState([]);
  const [opsiKategori, setOpsiKategori] = useState([]);

  const [bulan, setBulan] = useState('semua'); 
  const [tahun, setTahun] = useState('semua');
  const [desaTerpilih, setDesaTerpilih] = useState('');
  const [kategoriTerpilih, setKategoriTerpilih] = useState('');

  const COLORS = ['#1e3a8a', '#059669', '#475569', '#3b82f6', '#10b981', '#64748b'];

  const tampilkanData = useCallback(() => {
    setLoading(true);
    const url = `http://127.0.0.1:8000/api/laporan?bulan=${bulan}&tahun=${tahun}&desa=${desaTerpilih}&kategori=${kategoriTerpilih}`;
    axios.get(url)
      .then(res => { setLaporan(res.data.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [bulan, tahun, desaTerpilih, kategoriTerpilih]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/nelayan-options')
      .then(res => {
        setOpsiDesa(res.data.desa);
        setOpsiKategori(res.data.kategori);
      }).catch(err => console.error(err));
    tampilkanData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const totalSemuaKg = laporan.reduce((sum, item) => sum + Number(item.volume_kg), 0);
  const totalSemuaRp = laporan.reduce((sum, item) => sum + Number(item.nilai_rp), 0);
  const unikTrips = [...new Set(laporan.map(item => item.id_harian))];
  const totalTrip = unikTrips.length;

  const rekapIkan = laporan.reduce((acc, curr) => {
    acc[curr.ikan] = (acc[curr.ikan] || 0) + Number(curr.volume_kg);
    return acc;
  }, {});
  const dataGrafik = Object.keys(rekapIkan).map(key => ({ name: key, value: rekapIkan[key] }));

  const dataPerTrip = laporan.reduce((acc, curr) => {
    if (!acc[curr.id_harian]) {
        acc[curr.id_harian] = {
            id_harian: curr.id_harian, tanggal: curr.tanggal_trip,
            nelayan: curr.nama_responden, details: [], subtotal_kg: 0, subtotal_rp: 0
        };
    }
    acc[curr.id_harian].details.push(curr);
    acc[curr.id_harian].subtotal_kg += Number(curr.volume_kg);
    acc[curr.id_harian].subtotal_rp += Number(curr.nilai_rp);
    return acc;
  }, {});
  const arrayPerTrip = Object.values(dataPerTrip);

  // Fungsi export Excel juga udah ditambahin kolom Harga!
  const exportExcel = () => {
    if (laporan.length === 0) return alert("Belum ada data untuk diekspor.");
    let csvContent = "data:text/csv;charset=utf-8,Tanggal,Nama Nelayan,Jenis Ikan,Alat Tangkap,Volume (Kg),Harga (Rp/Kg),Nilai (Rp)\n";
    laporan.forEach((row) => {
      const hargaPerKg = row.volume_kg > 0 ? (row.nilai_rp / row.volume_kg) : 0;
      csvContent += `${row.tanggal_trip},${row.nama_responden},${row.ikan},${row.alat},${row.volume_kg},${hargaPerKg},${row.nilai_rp}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Detail_${bulan}_${tahun}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (laporan.length === 0) return alert("Belum ada data untuk dicetak.");
    window.print();
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '2rem' }}>
      <style>{styleCSS}</style>

      <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3 d-print-none">
        <div>
            <h3 className="fw-bold m-0 text-navy" style={{ letterSpacing: '-0.5px' }}>DOKUMEN LAPORAN PRODUKSI</h3>
            <p className="text-slate m-0" style={{ fontSize: '0.9rem' }}>Arsip dan rekapitulasi komprehensif hasil aktivitas nelayan</p>
        </div>
      </div>

      <div className="card-formal mb-4 p-4 d-print-none">
        <h6 className="fw-bold mb-3 text-navy" style={{ fontSize: '0.85rem' }}><i className="bi-funnel-fill me-2"></i>PARAMETER FILTERING</h6>
        <div className="row g-3 align-items-end">
          <div className="col-md-2">
            <label className="form-label text-slate fw-semibold mb-1" style={{ fontSize: '0.75rem' }}>Bulan</label>
            <select className="form-select form-select-sm" value={bulan} onChange={(e) => setBulan(e.target.value)}>
              <option value="semua">Semua Bulan</option>
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label text-slate fw-semibold mb-1" style={{ fontSize: '0.75rem' }}>Tahun</label>
            <select className="form-select form-select-sm" value={tahun} onChange={(e) => setTahun(e.target.value)}>
              <option value="semua">Semua Tahun</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label text-slate fw-semibold mb-1" style={{ fontSize: '0.75rem' }}>Asal Desa</label>
            <select className="form-select form-select-sm" value={desaTerpilih} onChange={(e) => setDesaTerpilih(e.target.value)}>
              <option value="">Semua Wilayah</option>
              {opsiDesa.map(d => <option key={d.id_desa} value={d.id_desa}>{d.nama_desa}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label text-slate fw-semibold mb-1" style={{ fontSize: '0.75rem' }}>Klasifikasi Nelayan</label>
            <select className="form-select form-select-sm" value={kategoriTerpilih} onChange={(e) => setKategoriTerpilih(e.target.value)}>
              <option value="">Semua Kategori</option>
              {opsiKategori.map(k => <option key={k.id_kat_nelayan} value={k.id_kat_nelayan}>{k.nama_kategori}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <button onClick={tampilkanData} className="btn btn-sm btn-navy w-100 py-2">
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>

      <div className="card-formal printable-area">
        <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center d-print-none">
            <h6 className="m-0 fw-bold text-navy" style={{ fontSize: '0.9rem' }}>PREVIEW DATA KELUARAN</h6>
            <div className="d-flex gap-2">
              <button onClick={exportExcel} className="btn btn-sm btn-outline-slate shadow-sm">
                <i className="bi-file-earmark-excel me-2 text-success"></i>Unduh CSV
              </button>
              <button onClick={exportPDF} className="btn btn-sm btn-outline-slate shadow-sm">
                <i className="bi-printer me-2 text-danger"></i>Cetak Dokumen
              </button>
            </div>
        </div>

        <div className="card-body p-0 pb-4">
          <div className="d-none d-print-block text-center mb-4 pt-4 px-5">
             <h3 className="fw-bold m-0 text-dark">DOKUMEN REKAPITULASI PRODUKSI HARIAN</h3>
             <p className="mb-0 text-dark">Sistem Informasi Data Perikanan Tangkap (SIDAPUT)</p>
             <p className="small text-dark m-0">Periode: {bulan === 'semua' ? 'Tahunan' : bulan} - {tahun === 'semua' ? 'Semua' : tahun}</p>
             <hr className="border-dark border-2 mt-3" />
          </div>

          {loading ? (
             <div className="p-5 text-center text-slate d-print-none">Menyusun instrumen laporan... ⏳</div>
          ) : (
            <div className="px-4 mt-4">
              
              {laporan.length > 0 && (
                <div className="row mb-5 align-items-center border rounded-1 mx-0 p-3" style={{ backgroundColor: '#ffffff' }}>
                  <div className="col-md-5 text-center p-3">
                    <h6 className="fw-bold text-navy mb-0" style={{ fontSize: '0.85rem' }}>DISTRIBUSI KOMODITAS (Kg)</h6>
                    <div style={{ width: '100%', height: '220px' }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie data={dataGrafik} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={2} dataKey="value" label>
                            {dataGrafik.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value} Kg`} contentStyle={{ borderRadius: '4px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="col-md-7 border-start pl-4">
                    <div>
                      <h6 className="fw-bold text-navy mb-3" style={{ fontSize: '0.85rem' }}>RINGKASAN EKSEKUTIF</h6>
                      <div className="row g-3">
                        <div className="col-sm-6">
                          <div className="p-3 bg-light rounded-1 border">
                            <div className="text-slate fw-semibold mb-1" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Akumulasi Volume</div>
                            <h5 className="fw-bold m-0 text-dark">{totalSemuaKg} Kg</h5>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="p-3 bg-light rounded-1 border">
                            <div className="text-slate fw-semibold mb-1" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Estimasi Nilai Produksi</div>
                            <h5 className="fw-bold m-0" style={{ color: '#047857' }}>Rp {totalSemuaRp.toLocaleString('id-ID')}</h5>
                          </div>
                        </div>
                        <div className="col-sm-12">
                          <div className="p-3 bg-light rounded-1 border d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-slate fw-semibold mb-1" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Total Aktivitas Melaut</div>
                                <h6 className="fw-bold m-0 text-dark">{totalTrip} Trip Terdata</h6>
                            </div>
                            <i className="bi-bar-chart-fill text-slate fs-3 opacity-50"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TABEL DETAIL PER TRIP (Sekarang ada kolom Harga per Kilo!) */}
              <div className="table-responsive border rounded-1 mb-4">
                <table className="table table-hover table-formal mb-0">
                  <thead>
                    <tr>
                      <th className="px-4 py-3" style={{width: '5%'}}>No</th>
                      <th>Rincian Tangkapan</th>
                      <th>Instrumen</th>
                      <th className="text-end">Volume (Kg)</th>
                      <th className="text-end">Harga Patokan (Rp/Kg)</th>
                      <th className="text-end px-4">Nilai Ekivalen (Rp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arrayPerTrip.length > 0 ? (
                      arrayPerTrip.map((trip) => (
                        <React.Fragment key={trip.id_harian}>
                          {/* BARIS HEADER TRIP (Perhatikan colspan jadi 6) */}
                          <tr style={{ backgroundColor: '#f1f5f9' }}>
                            <td colSpan="6" className="px-4 py-2 border-bottom">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <span className="fw-bold text-navy me-3" style={{ fontSize: '0.8rem' }}><i className="bi-calendar-event me-2"></i>{new Date(trip.tanggal).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</span>
                                  <span className="fw-semibold text-dark" style={{ fontSize: '0.8rem' }}><i className="bi-person-badge me-1"></i>{trip.nelayan}</span>
                                </div>
                                <div className="fw-bold text-dark" style={{ fontSize: '0.75rem' }}>
                                  Subtotal: {trip.subtotal_kg} Kg | <span style={{ color: '#047857' }}>Rp {trip.subtotal_rp.toLocaleString('id-ID')}</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                          
                          {/* BARIS RINCIAN IKAN */}
                          {trip.details.map((detail, idx) => {
                            // Hitung harga per kilo otomatis!
                            const hargaPerKg = detail.volume_kg > 0 ? (detail.nilai_rp / detail.volume_kg) : 0;
                            
                            return (
                              <tr key={idx}>
                                <td className="text-center text-slate small">{idx + 1}</td>
                                <td className="fw-semibold text-dark">{detail.ikan}</td>
                                <td><span className="text-slate">{detail.alat || '-'}</span></td>
                                <td className="text-end fw-semibold">{detail.volume_kg}</td>
                                <td className="text-end text-slate">Rp {Number(hargaPerKg).toLocaleString('id-ID')}</td>
                                <td className="text-end px-4" style={{ color: '#047857', fontWeight: '600' }}>{Number(detail.nilai_rp).toLocaleString('id-ID')}</td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr><td colSpan="6" className="text-center py-5 text-slate">Belum ada riwayat data pada parameter filter ini.</td></tr>
                    )}
                  </tbody>
                  {/* GRAND TOTAL */}
                  {arrayPerTrip.length > 0 && (
                    <tfoot className="bg-light fw-bold">
                      <tr>
                        {/* Colspan diubah jadi 4 biar rapi sebaris */}
                        <td colSpan="4" className="text-end py-3 text-navy" style={{ textTransform: 'uppercase', fontSize: '0.85rem' }}>Grand Total Akumulasi :</td>
                        <td colSpan="2" className="text-end px-4 py-3" style={{ color: '#047857' }}>Rp {totalSemuaRp.toLocaleString('id-ID')}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* CSS KHUSUS PRINT (ANTI TERPOTONG) */}
      <style>
        {`
          @media print {
            @page { size: landscape; margin: 1.5cm; }
            body, html, #root, .main-content { 
              background: white; height: auto !important; overflow: visible !important; font-family: 'Times New Roman', serif; 
            }
            .d-print-none, .sidebar-container { display: none !important; } 
            .card-formal, .printable-area { 
              box-shadow: none !important; border: none !important; margin: 0 !important; padding: 0 !important; overflow: visible !important;
            }
            .table-responsive { overflow: visible !important; max-height: none !important; }
            table { page-break-inside: auto; width: 100% !important; border-collapse: collapse !important; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
            .table-formal th { 
              background-color: #e2e8f0 !important; color: black !important; border: 1px solid #94a3b8 !important;
              -webkit-print-color-adjust: exact; print-color-adjust: exact;
            }
            .table td, .table th { border: 1px solid #94a3b8 !important; color: black !important; }
          }
        `}
      </style>
    </div>
  );
}