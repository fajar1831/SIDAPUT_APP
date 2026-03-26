<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RespondenController;
use Illuminate\Support\Facades\DB;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// 1. GET: Ambil Data Nelayan (Ditambah JOIN ke perairan dan kapal)
Route::get('/nelayan', function () {
    $nelayan = DB::table('tb_responden')
        ->join('ref_kat_nelayan', 'tb_responden.id_kat_nelayan', '=', 'ref_kat_nelayan.id_kat_nelayan')
        ->join('ref_desa', 'tb_responden.id_desa', '=', 'ref_desa.id_desa')
        ->leftJoin('ref_perairan', 'tb_responden.id_perairan', '=', 'ref_perairan.id_perairan')
        ->leftJoin('ref_kapal', 'tb_responden.id_kapal', '=', 'ref_kapal.id_kapal')
        ->select(
            'tb_responden.id_responden as id', 
            'tb_responden.nama_responden as nama', 
            'tb_responden.alamat_detail as alamat', 
            'tb_responden.id_desa',
            'tb_responden.id_kat_nelayan',
            'tb_responden.id_perairan',
            'tb_responden.id_kapal',
            'ref_kat_nelayan.nama_kategori as kategori',
            'ref_desa.nama_desa as desa',
            'ref_perairan.nama_perairan as perairan',
            'ref_kapal.nama_kapal as kapal'
        )
        ->orderBy('tb_responden.id_responden', 'DESC')
        ->get();

    return response()->json(['data' => $nelayan]);
});

// 2. GET: Ambil 4 pilihan Master buat Dropdown Form React
Route::get('/nelayan-options', function () {
    return response()->json([
        'desa' => DB::table('ref_desa')->get(),
        'kategori' => DB::table('ref_kat_nelayan')->get(),
        'perairan' => DB::table('ref_perairan')->get(),
        'kapal' => DB::table('ref_kapal')->get()
    ]);
});

// 3. POST: Tambah Nelayan Baru (Nambah input perairan & kapal)
Route::post('/nelayan', function (Request $request) {
    DB::table('tb_responden')->insert([
        'nama_responden' => $request->nama,
        'alamat_detail' => $request->alamat,
        'id_desa' => $request->id_desa,
        'id_kat_nelayan' => $request->id_kategori,
        'id_perairan' => $request->id_perairan,
        'id_kapal' => $request->id_kapal
    ]);
    return response()->json(['pesan' => 'Nelayan baru berhasil ditambahkan!']);
});

// 4. PUT: Update Data Nelayan
Route::put('/nelayan/{id}', function (Request $request, $id) {
    DB::table('tb_responden')->where('id_responden', $id)->update([
        'nama_responden' => $request->nama,
        'alamat_detail' => $request->alamat,
        'id_desa' => $request->id_desa,
        'id_kat_nelayan' => $request->id_kategori,
        'id_perairan' => $request->id_perairan,
        'id_kapal' => $request->id_kapal
    ]);
    return response()->json(['pesan' => 'Data nelayan berhasil diupdate!']);
});

// 5. DELETE: Hapus Data Nelayan (Tetap sama)
Route::delete('/nelayan/{id}', function ($id) {
    DB::table('tb_responden')->where('id_responden', $id)->delete();
    return response()->json(['pesan' => 'Data nelayan berhasil dihapus!']);
});

// 1. GET: Ambil data ikan + Harga TERBARU saja
Route::get('/ikan', function () {
    $ikan = DB::table('ref_ikan')
        ->leftJoin('log_harga_ikan', function($join) {
            // Trik khusus biar yang diambil cuma harga update-an terakhir
            $join->on('ref_ikan.id_ikan', '=', 'log_harga_ikan.id_ikan')
                 ->whereRaw('log_harga_ikan.id_log_harga IN (SELECT MAX(id_log_harga) FROM log_harga_ikan GROUP BY id_ikan)');
        })
        ->select('ref_ikan.id_ikan as id', 'ref_ikan.nama_ikan as nama', 'log_harga_ikan.harga_per_kg as harga', 'log_harga_ikan.tanggal_berlaku as update')
        ->orderBy('ref_ikan.nama_ikan', 'ASC')
        ->get();

    return response()->json(['data' => $ikan]);
});

// 2. POST: Tambah Ikan Baru (+ Langsung set harga awalnya)
Route::post('/ikan', function (Request $request) {
    // Insert nama ikan dan ambil ID barunya
    $id_ikan_baru = DB::table('ref_ikan')->insertGetId([
        'nama_ikan' => $request->nama_ikan
    ]);

    // Langsung catat harga awalnya ke tabel log_harga
    if ($request->harga) {
        DB::table('log_harga_ikan')->insert([
            'id_ikan' => $id_ikan_baru,
            'harga_per_kg' => $request->harga,
            'tanggal_berlaku' => date('Y-m-d') // Tanggal hari ini
        ]);
    }

    return response()->json(['pesan' => 'Ikan dan harga awal berhasil ditambahkan!']);
});

// 3. POST KHUSUS: Update Harga Ikan (Nambah riwayat harga baru)
Route::post('/ikan/{id}/harga', function (Request $request, $id) {
    DB::table('log_harga_ikan')->insert([
        'id_ikan' => $id,
        'harga_per_kg' => $request->harga,
        'tanggal_berlaku' => date('Y-m-d')
    ]);

    return response()->json(['pesan' => 'Harga patokan terbaru berhasil disimpan!']);
});

// 4. DELETE: Hapus Data Ikan
Route::delete('/ikan/{id}', function ($id) {
    // Hapus riwayat harganya dulu biar nggak error (karena ada relasi Foreign Key)
    DB::table('log_harga_ikan')->where('id_ikan', $id)->delete();
    // Baru hapus ikannya
    DB::table('ref_ikan')->where('id_ikan', $id)->delete();

    return response()->json(['pesan' => 'Data ikan berhasil dihapus!']);
});

/// API UNTUK MASTER ALAT TANGKAP
Route::get('/alat-tangkap', function () {
    $alat = DB::table('ref_alat_tangkap')->orderBy('nama_alat', 'ASC')->get();
    return response()->json(['data' => $alat]);
});

Route::post('/alat-tangkap', function (Illuminate\Http\Request $request) {
    DB::table('ref_alat_tangkap')->insert([
        'nama_alat' => $request->nama_alat
    ]);
    return response()->json(['pesan' => 'Instrumen tangkap baru berhasil diregistrasi!']);
});

Route::delete('/alat-tangkap/{id}', function ($id) {
    try {
        DB::table('ref_alat_tangkap')->where('id_alat', $id)->delete();
        return response()->json(['pesan' => 'Instrumen tangkap berhasil dihapus permanen!']);
    } catch (\Exception $e) {
        return response()->json(['pesan' => 'Gagal menghapus! Instrumen ini sudah terpakai di data transaksi.'], 500);
    }
});

Route::delete('/alat-tangkap/{id}', function ($id) {
    // Kita hapus data di tabel ref_alat_tangkap berdasarkan id_alat
    $hapus = DB::table('ref_alat_tangkap')->where('id_alat', $id)->delete();

    if ($hapus) {
        return response()->json([
            'status' => 'success',
            'pesan' => 'Alat tangkap berhasil dihapus!'
        ]);
    } else {
        // Kalau ID nggak ketemu
        return response()->json([
            'status' => 'error',
            'pesan' => 'Waduh, data tidak ditemukan.'
        ], 404);
    }
});

// 1. GET: Ambil data untuk pilihan Dropdown di Form (Sekarang bawa harga ikan!)
Route::get('/transaksi-options', function () {
    return response()->json([
        'nelayan' => DB::table('tb_responden')->select('id_responden as id', 'nama_responden as nama')->get(),
        // Query ikan diubah biar narik harga terbarunya juga
        'ikan' => DB::table('ref_ikan')
            ->leftJoin('log_harga_ikan', function($join) {
                $join->on('ref_ikan.id_ikan', '=', 'log_harga_ikan.id_ikan')
                     ->whereRaw('log_harga_ikan.id_log_harga IN (SELECT MAX(id_log_harga) FROM log_harga_ikan GROUP BY id_ikan)');
            })
            ->select('ref_ikan.id_ikan as id', 'ref_ikan.nama_ikan as nama', 'log_harga_ikan.harga_per_kg as harga')
            ->get(),
        'alat' => DB::table('ref_alat_tangkap')->select('id_alat as id', 'nama_alat as nama')->get()
    ]);
});

// 2. POST: Simpan Data Harian & Detail Tangkapan (Master-Detail)
Route::post('/transaksi', function (Request $request) {
    // Mulai Transaksi Database (Biar kalau error di tengah, datanya dibatalin semua/Rollback)
    DB::beginTransaction();
    
    try {
        // A. Simpan data Induk (Harian) dulu buat dapetin ID Trip-nya
        $id_harian = DB::table('trx_produksi_harian')->insertGetId([
            'id_responden' => $request->id_responden,
            'tanggal_trip' => $request->tanggal_trip
        ]);

        // B. Siapin array buat nyimpen rincian ikannya
        $detail_tangkapan = [];
        
        // Looping data ikan yang dikirim dari React
        foreach ($request->tangkapan as $item) {
            $detail_tangkapan[] = [
                'id_harian' => $id_harian, // Pake ID Trip yang baru aja dibuat
                'id_ikan'   => $item['id_ikan'],
                'id_alat'   => $item['id_alat'],
                'volume_kg' => $item['volume_kg'],
                'nilai_rp'  => $item['nilai_rp'],
            ];
        }

        // C. Simpan semua rincian ikannya sekaligus!
        DB::table('trx_detail_tangkapan')->insert($detail_tangkapan);

        // Kalau sukses semua, permanenkan di database
        DB::commit();
        return response()->json(['status' => 'success', 'pesan' => 'Data tangkapan harian berhasil disimpan!']);

    } catch (\Exception $e) {
        // Kalau ada error, batalin semua proses insert-nya
        DB::rollBack();
        return response()->json(['status' => 'error', 'pesan' => 'Gagal menyimpan: ' . $e->getMessage()], 500);
    }
});

// 3. GET: Ambil history laporan trip terbaru buat ditampilin di tabel
Route::get('/transaksi', function () {
    $history = DB::table('trx_produksi_harian')
        ->join('tb_responden', 'trx_produksi_harian.id_responden', '=', 'tb_responden.id_responden')
        ->select('trx_produksi_harian.id_harian', 'tb_responden.nama_responden as nama', 'trx_produksi_harian.tanggal_trip')
        ->orderBy('trx_produksi_harian.tanggal_trip', 'DESC')
        ->take(10) // Tampilkan 10 trip terakhir aja biar cepat
        ->get();
        
    return response()->json(['data' => $history]);
});

Route::get('/laporan', function (Request $request) {
    $bulan = $request->query('bulan', 'semua');
    $tahun = $request->query('tahun', 'semua');
    $id_desa = $request->query('desa');
    $id_kategori = $request->query('kategori');

    $query = DB::table('trx_detail_tangkapan')
        ->join('trx_produksi_harian', 'trx_detail_tangkapan.id_harian', '=', 'trx_produksi_harian.id_harian')
        ->join('tb_responden', 'trx_produksi_harian.id_responden', '=', 'tb_responden.id_responden')
        ->join('ref_ikan', 'trx_detail_tangkapan.id_ikan', '=', 'ref_ikan.id_ikan')
        ->leftJoin('ref_alat_tangkap', 'trx_detail_tangkapan.id_alat', '=', 'ref_alat_tangkap.id_alat')
        ->select(
            'trx_produksi_harian.id_harian',
            'trx_produksi_harian.tanggal_trip',
            'tb_responden.nama_responden',
            'ref_ikan.nama_ikan as ikan',
            'ref_alat_tangkap.nama_alat as alat',
            'trx_detail_tangkapan.volume_kg',
            'trx_detail_tangkapan.nilai_rp'
        );

    // Filter data
    if ($bulan !== 'semua') {
        $query->whereMonth('trx_produksi_harian.tanggal_trip', $bulan);
    }
    if ($tahun !== 'semua') {
        $query->whereYear('trx_produksi_harian.tanggal_trip', $tahun);
    }
    if (!empty($id_desa)) {
        $query->where('tb_responden.id_desa', $id_desa);
    }
    if (!empty($id_kategori)) {
        $query->where('tb_responden.id_kat_nelayan', $id_kategori);
    }

    // Urutkan dari trip terbaru
    $laporan = $query->orderBy('trx_produksi_harian.tanggal_trip', 'DESC')->get();

    return response()->json(['data' => $laporan]);
});

// API UNTUK DASHBOARD UTAMA (UPGRADE 1 TAHUN)
Route::get('/dashboard', function (Request $request) {
    // Default-nya sekarang 'semua' bulan, untuk tahun saat ini
    $bulan = $request->query('bulan', 'semua');
    $tahun = $request->query('tahun', date('Y'));

    // 1. Total Produksi & Nilai
    $queryTotal = DB::table('trx_detail_tangkapan')
        ->join('trx_produksi_harian', 'trx_detail_tangkapan.id_harian', '=', 'trx_produksi_harian.id_harian');
    if ($bulan !== 'semua') $queryTotal->whereMonth('trx_produksi_harian.tanggal_trip', $bulan);
    if ($tahun !== 'semua') $queryTotal->whereYear('trx_produksi_harian.tanggal_trip', $tahun);
    $total = $queryTotal->selectRaw('COALESCE(SUM(volume_kg), 0) as total_kg, COALESCE(SUM(nilai_rp), 0) as total_rp')->first();

    // 2. Hitung RTP Aktif
    $queryRTP = DB::table('trx_produksi_harian')->distinct('id_responden');
    if ($bulan !== 'semua') $queryRTP->whereMonth('tanggal_trip', $bulan);
    if ($tahun !== 'semua') $queryRTP->whereYear('tanggal_trip', $tahun);
    $rtp_aktif = $queryRTP->count('id_responden');
    
    $total_rtp = DB::table('tb_responden')->count();

    // 3. Top Ikan
    $queryTop = DB::table('trx_detail_tangkapan')
        ->join('trx_produksi_harian', 'trx_detail_tangkapan.id_harian', '=', 'trx_produksi_harian.id_harian')
        ->join('ref_ikan', 'trx_detail_tangkapan.id_ikan', '=', 'ref_ikan.id_ikan');
    if ($bulan !== 'semua') $queryTop->whereMonth('trx_produksi_harian.tanggal_trip', $bulan);
    if ($tahun !== 'semua') $queryTop->whereYear('trx_produksi_harian.tanggal_trip', $tahun);
    $top_ikan = $queryTop->selectRaw('ref_ikan.nama_ikan, SUM(trx_detail_tangkapan.volume_kg) as total_kg')
        ->groupBy('ref_ikan.id_ikan', 'ref_ikan.nama_ikan')
        ->orderByDesc('total_kg')
        ->limit(2)
        ->get();

    // 4. Tren Harian / Bulanan (Grafik Garis)
    $queryTren = DB::table('trx_detail_tangkapan')
        ->join('trx_produksi_harian', 'trx_detail_tangkapan.id_harian', '=', 'trx_produksi_harian.id_harian');
    if ($tahun !== 'semua') $queryTren->whereYear('trx_produksi_harian.tanggal_trip', $tahun);

    if ($bulan !== 'semua') {
        // Jika filter 1 bulan: Tampilkan berdasarkan TANGGAL (Harian)
        $queryTren->whereMonth('trx_produksi_harian.tanggal_trip', $bulan);
        $tren = $queryTren->selectRaw('DAY(trx_produksi_harian.tanggal_trip) as label, SUM(trx_detail_tangkapan.volume_kg) as kg')
            ->groupBy(DB::raw('DAY(trx_produksi_harian.tanggal_trip)'))
            ->orderBy('label')
            ->get()->map(function($item) {
                return ['tanggal' => 'Tgl ' . $item->label, 'kg' => (float)$item->kg];
            });
    } else {
        // Jika filter 1 Tahun (Semua Bulan): Tampilkan berdasarkan BULAN
        $nama_bulan = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        $tren = $queryTren->selectRaw('MONTH(trx_produksi_harian.tanggal_trip) as label, SUM(trx_detail_tangkapan.volume_kg) as kg')
            ->groupBy(DB::raw('MONTH(trx_produksi_harian.tanggal_trip)'))
            ->orderBy('label')
            ->get()->map(function($item) use ($nama_bulan) {
                return ['tanggal' => $nama_bulan[$item->label], 'kg' => (float)$item->kg];
            });
    }

    // 5. Kategori Nelayan
    $kategori = DB::table('tb_responden')
        ->join('ref_kat_nelayan', 'tb_responden.id_kat_nelayan', '=', 'ref_kat_nelayan.id_kat_nelayan')
        ->selectRaw('ref_kat_nelayan.nama_kategori, COUNT(tb_responden.id_responden) as jumlah')
        ->groupBy('ref_kat_nelayan.id_kat_nelayan', 'ref_kat_nelayan.nama_kategori')
        ->get();

    return response()->json([
        'total_kg' => (float)$total->total_kg,
        'total_rp' => (float)$total->total_rp,
        'rtp_aktif' => $rtp_aktif,
        'total_rtp' => $total_rtp,
        'top_ikan' => $top_ikan,
        'tren_harian' => $tren,
        'kategori_nelayan' => $kategori
    ]);
});