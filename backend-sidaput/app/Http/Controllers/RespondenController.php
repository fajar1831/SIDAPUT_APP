<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RespondenController extends Controller
{
    public function index()
    {
        // Kita pakai DB Query Builder buat nge-join tabel tb_responden dengan ref_kat_nelayan
        // Biar kita bisa langsung dapet teks "Penuh" atau "Sambilan" (bukan cuma ID angkanya doang)
        $nelayan = DB::table('tb_responden')
            ->join('ref_kat_nelayan', 'tb_responden.id_kat_nelayan', '=', 'ref_kat_nelayan.id_kat_nelayan')
            ->select(
                'tb_responden.id_responden as id', 
                'tb_responden.nama_responden as nama', 
                'tb_responden.alamat_detail as alamat', 
                'ref_kat_nelayan.nama_kategori as kategori'
            )
            ->get();

        // Kembalikan datanya dalam format JSON (format yang dimengerti React)
        return response()->json([
            'status' => 'success',
            'pesan' => 'Data nelayan berhasil diambil',
            'data' => $nelayan
        ]);
    }
}