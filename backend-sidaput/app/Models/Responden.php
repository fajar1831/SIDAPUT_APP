<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Responden extends Model
{
    // Kasih tahu Laravel nama tabel aslinya
    protected $table = 'tb_responden';
    
    // Kasih tahu Primary Key-nya
    protected $primaryKey = 'id_responden';
    
    // Matikan fitur timestamp karena di SQL kita tadi nggak bikin kolom created_at/updated_at
    public $timestamps = false;
    
    // Izinkan semua kolom diisi
    protected $guarded = [];
}