// =============================================
//   LaundryKu - Aplikasi CRUD Local Storage
// =============================================

// 1. AMBIL ELEMEN DOM
const formLaundry      = document.getElementById('form-laundry');
const inputEditId      = document.getElementById('edit-id');
const inputNama        = document.getElementById('nama-pelanggan');
const inputBerat       = document.getElementById('berat-kg');
const inputStatus      = document.getElementById('status-cuci');
const btnSimpan        = document.getElementById('btn-simpan');
const judulForm        = document.getElementById('judul-form');
const wadahPesanan     = document.getElementById('wadah-pesanan');

// Elemen statistik
const elTotalPesanan   = document.getElementById('total-pesanan');
const elTotalAntri     = document.getElementById('total-antri');
const elTotalProses    = document.getElementById('total-proses');
const elTotalSelesai   = document.getElementById('total-selesai');

// =============================================
// [READ] 2. AMBIL DATA DARI LOCALSTORAGE
// =============================================
// Jika 'datalaundry' di gudang kosong, mulai dengan Array kosong []
let daftarPesanan = JSON.parse(localStorage.getItem('dataLaundry')) || [];

// =============================================
// 3. FUNGSI SIMPAN KE LOCALSTORAGE
// =============================================
function simpanKeGudang() {
    localStorage.setItem('dataLaundry', JSON.stringify(daftarPesanan));
}

// =============================================
// 4. FUNGSI RENDER (Menggambar Ulang Layar)
// =============================================
function renderPesanan() {
    // Hitung harga: Rp 5.000 per kg
    const HARGA_PER_KG = 5000;
    
    // --- Update Statistik ---
    elTotalPesanan.textContent = daftarPesanan.length;
    elTotalAntri.textContent   = daftarPesanan.filter(p => p.status === 'Antri').length;
    elTotalProses.textContent  = daftarPesanan.filter(p => p.status === 'Proses').length;
    elTotalSelesai.textContent = daftarPesanan.filter(p => p.status === 'Selesai').length;
    
    // --- Kosongkan Wadah ---
    wadahPesanan.innerHTML = "";
    
    // --- Tampilkan Empty State Jika Kosong ---
    if (daftarPesanan.length === 0) {
        wadahPesanan.innerHTML = `
            <div class="empty-state">
                <p>📭 Belum ada pesanan. Tambahkan pesanan pertama di atas!</p>
            </div>
        `;
        return; // Hentikan fungsi di sini
    }
    
    // --- Perulangan: Cetak Setiap Kartu Pesanan ---
    for (let i = 0; i < daftarPesanan.length; i++) {
        let p = daftarPesanan[i];
        let totalHarga = p.berat * HARGA_PER_KG;
        let hargaFormatted = totalHarga.toLocaleString('id-ID');
        
        wadahPesanan.innerHTML += `
            <div class="kartu-pesanan">
                <div class="info-pesanan">
                    <div class="nama-pelanggan-kartu">${p.nama}</div>
                    <div class="detail-pesanan">
                        ⚖️ ${p.berat} kg &nbsp;|&nbsp; 💰 Rp ${hargaFormatted}
                    </div>
                </div>
                <span class="badge-status badge-${p.status}">${p.status}</span>
                <div class="aksi-pesanan">
                    <button class="btn btn-edit" onclick="mulaiEdit(${p.id})">✏️ Edit</button>
                    <button class="btn btn-hapus" onclick="hapusPesanan(${p.id})">🗑️ Hapus</button>
                </div>
            </div>
        `;
    }
}

// Panggil render pertama kali saat web dibuka
renderPesanan();

// =============================================
// [CREATE] 5. LOGIKA SAAT FORM DIKIRIM
// =============================================
formLaundry.addEventListener('submit', function(event) {
    event.preventDefault(); // Cegah halaman reload
    
    const idYangDiedit = inputEditId.value;
    
    // Cek: apakah ini mode EDIT atau mode TAMBAH BARU?
    if (idYangDiedit !== "") {
        // --- MODE UPDATE ---
        // Ubah parseInt agar ID cocok dengan yang tersimpan (number)
        const idTarget = parseInt(idYangDiedit);
        
        // Temukan index pesanan yang ingin diubah
        const index = daftarPesanan.findIndex(p => p.id === idTarget);
        
        // Timpa data pada index tersebut dengan data baru dari form
        daftarPesanan[index].nama   = inputNama.value;
        daftarPesanan[index].berat  = parseInt(inputBerat.value);
        daftarPesanan[index].status = inputStatus.value;
        
        batalEdit(); // Kembalikan form ke mode normal
        
    } else {
        // --- MODE CREATE (Tambah Baru) ---
        let pesananBaru = {
            id: Date.now(), // Waktu sekarang (milidetik) sebagai ID unik
            nama: inputNama.value,
            berat: parseInt(inputBerat.value),
            status: inputStatus.value
        };
        
        daftarPesanan.push(pesananBaru); // Masukkan ke Array
        formLaundry.reset(); // Kosongkan form
    }
    
    simpanKeGudang(); // Simpan ke Gudang (Local Storage)
    renderPesanan();  // Gambar ulang layar
});

// =============================================
// [UPDATE] 6. FUNGSI MULAI MODE EDIT
// =============================================
window.mulaiEdit = function(idTarget) {
    // Temukan data pesanan yang mau diedit berdasarkan ID
    const pesanan = daftarPesanan.find(p => p.id === idTarget);
    
    if (pesanan) {
        // Isi form dengan data pesanan yang dipilih
        inputEditId.value   = pesanan.id;
        inputNama.value     = pesanan.nama;
        inputBerat.value    = pesanan.berat;
        inputStatus.value   = pesanan.status;
        
        // Ubah tampilan judul dan tombol form
        judulForm.textContent  = "✏️ Mode Edit Pesanan";
        btnSimpan.textContent  = "💾 Simpan Perubahan";
        
        // Scroll halaman ke atas agar form terlihat
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// =============================================
// FUNGSI BATAL EDIT
// =============================================
window.batalEdit = function() {
    // Kembalikan form ke keadaan semula
    inputEditId.value      = "";
    formLaundry.reset();
    judulForm.textContent  = "✏️ Tambah Pesanan Baru";
    btnSimpan.textContent  = "+ Tambah Pesanan";
};

// =============================================
// [DELETE] 7. FUNGSI HAPUS SATU PESANAN
// =============================================
window.hapusPesanan = function(idTarget) {
    // Konfirmasi sebelum hapus
    const yakin = confirm("Yakin ingin menghapus pesanan ini?");
    if (!yakin) return;
    
    // Saring Array: biarkan semua KECUALI yang ID-nya sama dengan target
    daftarPesanan = daftarPesanan.filter(p => p.id !== idTarget);
    
    simpanKeGudang();
    renderPesanan();
};

// =============================================
// [DELETE ALL] 8. FUNGSI HAPUS SEMUA
// =============================================
window.hapusSemua = function() {
    const yakin = confirm("PERINGATAN: Ini akan menghapus SEMUA pesanan! Lanjutkan?");
    if (!yakin) return;
    
    daftarPesanan = []; // Kosongkan array
    simpanKeGudang();
    renderPesanan();
};