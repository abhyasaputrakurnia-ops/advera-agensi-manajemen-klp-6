// =====================================================
// KALKULATOR ADVERA
// =====================================================


// -----------------------------------------------------
// BAGIAN SOFTWARE ENGINEER 1
// Membaca input dan menghitung harga dasar
// (harga paket x durasi kampanye dalam minggu)
// -----------------------------------------------------

// Mengambil elemen-elemen dari halaman
const formKalkulator = document.getElementById("calc-form");
const inputPaket     = document.getElementById("paket");
const inputDurasi    = document.getElementById("durasi");
const inputPromo     = document.getElementById("promo");

const hasilPaket  = document.getElementById("hasil-paket");
const hasilAwal   = document.getElementById("hasil-awal");
const hasilDiskon = document.getElementById("hasil-diskon");
const hasilTotal  = document.getElementById("hasil-total");
const hasilPesan  = document.getElementById("hasil-pesan");

// Mengubah angka menjadi format Rupiah, contoh 1200000 -> "Rp1.200.000"
function formatRupiah(angka) {
  return "Rp" + angka.toLocaleString("id-ID");
}

// Menghitung harga dasar: harga paket dikali durasi kampanye
function hitungHargaDasar(hargaPaket, durasi) {
  return hargaPaket * durasi;
}


// -----------------------------------------------------
// BAGIAN SOFTWARE ENGINEER 2
// Memeriksa kode promo dengan percabangan if / else
// Aturan: diskon 15% dengan kode ADVERA15,
// hanya untuk kampanye minimal 4 minggu
// -----------------------------------------------------

const KODE_PROMO    = "ADVERA15";
const PERSEN_DISKON = 15;
const MINIMAL_MINGGU = 4;

// Mengembalikan besar diskon, pesan, dan status untuk tampilan
function hitungDiskon(hargaAwal, durasi, kode) {
  // Huruf kecil/besar dan spasi tidak berpengaruh: " advera15 " tetap dianggap benar
  const kodeBersih = kode.trim().toUpperCase();

  if (kodeBersih === "") {
    // Tidak memasukkan kode promo
    if (durasi >= MINIMAL_MINGGU) {
      return {
        diskon: 0,
        status: "info",
        pesan: "Kampanye Anda sudah " + durasi + " minggu. Masukkan kode " + KODE_PROMO + " untuk hemat " + PERSEN_DISKON + "%."
      };
    } else {
      return { diskon: 0, status: "info", pesan: "Perhitungan selesai tanpa kode promo." };
    }

  } else if (kodeBersih === KODE_PROMO) {
    // Kode benar, cek syarat durasi minimal
    if (durasi >= MINIMAL_MINGGU) {
      const diskon = Math.round(hargaAwal * PERSEN_DISKON / 100);
      return {
        diskon: diskon,
        status: "success",
        pesan: "Kode " + KODE_PROMO + " berhasil dipakai. Anda hemat " + formatRupiah(diskon) + "."
      };
    } else {
      const kurang = MINIMAL_MINGGU - durasi;
      return {
        diskon: 0,
        status: "warning",
        pesan: "Kode " + KODE_PROMO + " berlaku untuk kampanye minimal " + MINIMAL_MINGGU + " minggu. Tambah " + kurang + " minggu lagi untuk mendapat diskon."
      };
    }

  } else {
    // Kode yang dimasukkan tidak dikenal
    return { diskon: 0, status: "error", pesan: "Kode promo \"" + kode.trim() + "\" tidak dikenal." };
  }
}


// -----------------------------------------------------
// MENJALANKAN PERHITUNGAN SAAT TOMBOL DITEKAN
// -----------------------------------------------------

// Mengganti warna pesan sesuai status (diatur di styles.css)
function tampilkanPesan(teks, status) {
  hasilPesan.textContent = teks;
  hasilPesan.className = "result-message is-" + status;
}

formKalkulator.addEventListener("submit", function (event) {
  event.preventDefault(); // supaya halaman tidak memuat ulang

  const hargaPaket = Number(inputPaket.value);
  const durasi     = Number(inputDurasi.value);
  // Ambil nama paket tanpa keterangan harga di dalam kurung
  const namaPaket  = inputPaket.options[inputPaket.selectedIndex].text.split(" (")[0];

  // Pastikan paket sudah dipilih
  if (!hargaPaket) {
    tampilkanPesan("Pilih paket terlebih dahulu.", "error");
    inputPaket.focus();
    return;
  }

  // Pastikan durasi berupa bilangan bulat 1 sampai 52
  if (!Number.isInteger(durasi) || durasi < 1 || durasi > 52) {
    tampilkanPesan("Isi durasi kampanye antara 1 sampai 52 minggu.", "error");
    inputDurasi.focus();
    return;
  }

  // Bagian SE 1: harga dasar
  const hargaAwal = hitungHargaDasar(hargaPaket, durasi);

  // Bagian SE 2: diskon kode promo
  const promo = hitungDiskon(hargaAwal, durasi, inputPromo.value);
  const totalBayar = hargaAwal - promo.diskon;

  // Menampilkan rincian ke layar
  hasilPaket.textContent  = namaPaket + ", " + durasi + " minggu";
  hasilAwal.textContent   = formatRupiah(hargaAwal);
  hasilDiskon.textContent = "− " + formatRupiah(promo.diskon);
  hasilTotal.textContent  = formatRupiah(totalBayar);
  tampilkanPesan(promo.pesan, promo.status);
});


// -----------------------------------------------------
// TAMBAHAN SOFTWARE ENGINEER 1
// Tombol "Hitung paket ini" di katalog langsung memilih
// paketnya di kalkulator, dan tombol "Atur ulang"
// -----------------------------------------------------

const tombolPaket = document.querySelectorAll("[data-paket]");

tombolPaket.forEach(function (tombol) {
  tombol.addEventListener("click", function () {
    inputPaket.value = tombol.dataset.paket;
    const namaDipilih = inputPaket.options[inputPaket.selectedIndex].text.split(" (")[0];
    hasilPaket.textContent = namaDipilih + " dipilih";
    tampilkanPesan("Paket sudah dipilih. Isi durasi kampanye lalu tekan Hitung Total Biaya.", "info");

    // Tunggu halaman selesai bergulir, lalu arahkan kursor ke kolom durasi
    setTimeout(function () {
      inputDurasi.focus({ preventScroll: true });
    }, 600);
  });
});

formKalkulator.addEventListener("reset", function () {
  hasilPaket.textContent  = "Belum ada paket dipilih";
  hasilAwal.textContent   = formatRupiah(0);
  hasilDiskon.textContent = "− " + formatRupiah(0);
  hasilTotal.textContent  = formatRupiah(0);
  hasilPesan.textContent  = "Isi formulir lalu tekan Hitung Total Biaya.";
  hasilPesan.className    = "result-message";
});


// -----------------------------------------------------
// MENU NAVIGASI DI HP (bagian header milik CEO)
// -----------------------------------------------------

const tombolMenu = document.getElementById("nav-toggle");
const menuNav    = document.getElementById("site-nav");

// Menandai bahwa JavaScript aktif, supaya CSS boleh menyembunyikan menu di HP
document.documentElement.classList.add("js-nav");

function aturMenu(terbuka) {
  menuNav.classList.toggle("is-open", terbuka);
  tombolMenu.setAttribute("aria-expanded", terbuka ? "true" : "false");
}

tombolMenu.addEventListener("click", function () {
  const sedangTerbuka = tombolMenu.getAttribute("aria-expanded") === "true";
  aturMenu(!sedangTerbuka);
});

// Menu tertutup lagi setelah salah satu link diklik
menuNav.querySelectorAll("a").forEach(function (link) {
  link.addEventListener("click", function () {
    aturMenu(false);
  });
});

// Tombol Esc juga menutup menu
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && tombolMenu.getAttribute("aria-expanded") === "true") {
    aturMenu(false);
    tombolMenu.focus();
  }
});


// -----------------------------------------------------
// TOMBOL "BUKA SEMUA" DI TANYA JAWAB (bagian katalog milik PM 2)
// -----------------------------------------------------

const tombolSemua = document.getElementById("faq-toggle-all");
const daftarTanya = document.querySelectorAll(".faq-item");

function perbaruiTombolSemua() {
  const semuaTerbuka = Array.from(daftarTanya).every(function (item) {
    return item.open;
  });
  tombolSemua.textContent = semuaTerbuka ? "Tutup semua" : "Buka semua";
  tombolSemua.setAttribute("aria-pressed", semuaTerbuka ? "true" : "false");
}

tombolSemua.addEventListener("click", function () {
  const adaYangTertutup = Array.from(daftarTanya).some(function (item) {
    return !item.open;
  });
  daftarTanya.forEach(function (item) {
    item.open = adaYangTertutup;
  });
  perbaruiTombolSemua();
});

// Label tombol ikut berubah kalau pertanyaan dibuka satu per satu
daftarTanya.forEach(function (item) {
  item.addEventListener("toggle", perbaruiTombolSemua);
});
