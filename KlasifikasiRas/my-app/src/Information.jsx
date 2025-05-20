import React from 'react';
import { Link } from 'react-router-dom';
import './Information.css';

function Information() {
  return (
    <div className="information-page">
      {/* Hero Section */}
      <section className="info-hero-section">
        <div className="container">
          <h1 className="section-title">Tentang RaceAI</h1>
          <p className="info-subtitle">Memahami teknologi kami dan cara menggunakannya</p>
        </div>
      </section>

      {/* About the Project */}
      <section className="info-section">
        <div className="container">
          <h2 className="info-heading">Misi Kami</h2>
          <div className="info-content">
            <p>
              RaceAI adalah platform pendidikan yang mengeksplorasi keragaman wajah di berbagai latar belakang ras menggunakan 
              kecerdasan buatan. Misi kami adalah menyediakan alat bagi para peneliti, mahasiswa, dan penggemar AI 
              untuk lebih memahami karakteristik wajah di seluruh populasi sambil mempromosikan kesadaran akan keragaman.
            </p>
            <p>
              Kami telah mengembangkan dataset komprehensif yang berisi gambar wajah dari beragam latar belakang ras, 
              yang mendukung alat pendeteksi ras berbasis AI kami. Teknologi ini menunjukkan bagaimana pembelajaran mesin 
              dapat mengidentifikasi pola dalam struktur dan fitur wajah yang terkait dengan kelompok etnis yang berbeda.
            </p>
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="info-section info-section-alt">
        <div className="container">
          <h2 className="info-heading">Bagaimana cara menggunakan RaceAI</h2>
          <div className="info-cards">
            <div className="info-card">
              <div className="info-card-number">1</div>
              <h3 className="info-card-title">Kunjungi Cek Ras</h3>
              <p className="info-card-description">
                Buka halaman "Cek Ras" dengan menggunakan menu navigasi atau tombol pada halaman beranda.
              </p>
              <div className="info-card-action">
                <Link to="/check-race" className="button primary-button">Pergi ke Cek Ras</Link>
              </div>
            </div>
            <div className="info-card">
              <div className="info-card-number">2</div>
              <h3 className="info-card-title">Upload Foto</h3>
              <p className="info-card-description">
                Klik tombol unggah untuk memilih foto yang jelas dan menghadap ke depan. Gambar harus menunjukkan wajah anda dengan jelas tanpa halangan.
              </p>
            </div>
            <div className="info-card">
              <div className="info-card-number">3</div>
              <h3 className="info-card-title">Hasil Analisa</h3>
              <p className="info-card-description">
                AI kami akan memproses gambar anda dan menampilkan kategori ras yang terdeteksi bersama dengan persentase kepercayaan.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Information;