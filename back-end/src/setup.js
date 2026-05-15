const pool = require('./db');

async function ensureTables() {
  try {
    // NhanVien (Staff)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS nhan_vien (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        ho_ten VARCHAR(255) NOT NULL,
        so_dien_thoai VARCHAR(20),
        vai_tro ENUM('MANAGER', 'WAREHOUSE', 'SALES', 'ONLINE_SALES', 'MARKETING') NOT NULL,
        trang_thai ENUM('HOAT_DONG', 'KHOA') DEFAULT 'HOAT_DONG',
        ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // DanhMuc (Product Categories)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS danh_muc (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ten_danh_muc VARCHAR(255) NOT NULL UNIQUE,
        mo_ta TEXT,
        trang_thai ENUM('HOAT_DONG', 'KHONG_HOAT_DONG') DEFAULT 'HOAT_DONG',
        ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // NhaCungCap (Supplier)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS nha_cung_cap (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ten_ncc VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255),
        so_dien_thoai VARCHAR(20),
        dia_chi TEXT,
        trang_thai ENUM('HOAT_DONG', 'KHONG_HOAT_DONG') DEFAULT 'HOAT_DONG',
        ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // HangHoa (Products)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hang_hoa (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ma_sp VARCHAR(50) NOT NULL UNIQUE,
        ten_sp VARCHAR(255) NOT NULL,
        id_danh_muc INT NOT NULL,
        id_nha_cung_cap INT NOT NULL,
        don_vi_tinh ENUM('HOP', 'GOI', 'CHIEC', 'THUNG', 'LON') DEFAULT 'HOP',
        gia_nhap DECIMAL(12, 0) NOT NULL,
        gia_ban DECIMAL(12, 0) NOT NULL,
        ton_kho INT DEFAULT 0,
        ton_kho_toi_thieu INT DEFAULT 10,
        han_su_dung DATE,
        ngay_nhap_batch DATE,
        trang_thai ENUM('HOAT_DONG', 'NGUNG_KD') DEFAULT 'HOAT_DONG',
        ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (id_danh_muc) REFERENCES danh_muc(id),
        FOREIGN KEY (id_nha_cung_cap) REFERENCES nha_cung_cap(id),
        INDEX (ma_sp),
        INDEX (ten_sp)
      ) ENGINE=InnoDB;
    `);

    // Voucher
    await pool.query(`
      CREATE TABLE IF NOT EXISTS voucher (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ma_voucher VARCHAR(50) NOT NULL UNIQUE,
        gia_tri_giam DECIMAL(12, 0),
        phan_tram_giam INT,
        so_lan_su_dung INT DEFAULT 0,
        so_lan_su_dung_toi_da INT,
        gia_toi_thieu DECIMAL(12, 0),
        han_su_dung_tu DATE NOT NULL,
        han_su_dung_den DATE NOT NULL,
        danh_muc_ap_dung VARCHAR(255),
        trang_thai ENUM('HOAT_DONG', 'KHONG_HOAT_DONG') DEFAULT 'HOAT_DONG',
        ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // HoaDonBan (Sales Invoice - POS)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hoa_don_ban (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ma_hdb VARCHAR(50) NOT NULL UNIQUE,
        ngay_ban DATETIME NOT NULL,
        id_nhan_vien INT NOT NULL,
        id_khach_hang INT,
        ten_khach_hang VARCHAR(255),
        ma_voucher VARCHAR(50),
        tong_tien_hang DECIMAL(12, 0),
        tien_giam DECIMAL(12, 0) DEFAULT 0,
        tong_can_thanh_toan DECIMAL(12, 0),
        phuong_thuc_thanh_toan ENUM('TIEN_MAT', 'CHUYEN_KHOAN', 'QUET_THE') DEFAULT 'TIEN_MAT',
        trang_thai ENUM('CHO_XAC_NHAN', 'CHUA_THANH_TOAN', 'DA_THANH_TOAN', 'DA_HUY') DEFAULT 'CHO_XAC_NHAN',
        ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_nhan_vien) REFERENCES nhan_vien(id),
        INDEX (ma_hdb),
        INDEX (ngay_ban)
      ) ENGINE=InnoDB;
    `);

    // ChiTietHoaDonBan (Sales Invoice Detail)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chi_tiet_hoa_don_ban (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_hoa_don INT NOT NULL,
        id_hang_hoa INT NOT NULL,
        gia_ban DECIMAL(12, 0),
        so_luong INT,
        thanh_tien DECIMAL(12, 0),
        FOREIGN KEY (id_hoa_don) REFERENCES hoa_don_ban(id),
        FOREIGN KEY (id_hang_hoa) REFERENCES hang_hoa(id)
      ) ENGINE=InnoDB;
    `);

    // PhieuNhapHang (Receipt Invoice)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS phieu_nhap_hang (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ma_pnh VARCHAR(50) NOT NULL UNIQUE,
        ngay_nhap DATETIME NOT NULL,
        id_nha_cung_cap INT NOT NULL,
        id_nhan_vien INT NOT NULL,
        so_luong_dat INT,
        so_luong_thuc_nhan INT,
        con_thieu INT DEFAULT 0,
        trang_thai_thanh_toan ENUM('DA_THANH_TOAN_HET', 'CHUA_THANH_TOAN_HET') DEFAULT 'CHUA_THANH_TOAN_HET',
        tong_tien DECIMAL(12, 0),
        ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_nha_cung_cap) REFERENCES nha_cung_cap(id),
        FOREIGN KEY (id_nhan_vien) REFERENCES nhan_vien(id),
        INDEX (ma_pnh)
      ) ENGINE=InnoDB;
    `);

    // ChiTietPhieuNhap (Receipt Invoice Detail)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chi_tiet_phieu_nhap (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_phieu_nhap INT NOT NULL,
        id_hang_hoa INT NOT NULL,
        gia_nhap DECIMAL(12, 0),
        so_luong INT,
        ngay_san_xuat DATE,
        han_su_dung DATE,
        thanh_tien DECIMAL(12, 0),
        FOREIGN KEY (id_phieu_nhap) REFERENCES phieu_nhap_hang(id),
        FOREIGN KEY (id_hang_hoa) REFERENCES hang_hoa(id)
      ) ENGINE=InnoDB;
    `);

    // DonHangOnline (Online Orders)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS don_hang_online (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ma_don VARCHAR(50) NOT NULL UNIQUE,
        ngay_dat DATETIME NOT NULL,
        ten_khach_hang VARCHAR(255) NOT NULL,
        so_dien_thoai VARCHAR(20) NOT NULL,
        dia_chi_giao VARCHAR(500) NOT NULL,
        ghi_chu_don TEXT,
        kenh_dat_hang ENUM('FACEBOOK', 'WEBSITE', 'ZALO') DEFAULT 'WEBSITE',
        id_nhan_vien INT,
        ma_voucher VARCHAR(50),
        don_vi_van_chuyen VARCHAR(255),
        phi_giao_hang DECIMAL(12, 0) DEFAULT 0,
        ngay_giao_du_kien DATE,
        ma_van_don VARCHAR(100),
        tong_tien_hang DECIMAL(12, 0),
        tien_giam DECIMAL(12, 0) DEFAULT 0,
        tong_thanh_toan DECIMAL(12, 0),
        phuong_thuc_thanh_toan ENUM('COD', 'CHUYEN_KHOAN') DEFAULT 'COD',
        trang_thai ENUM('CHO_XU_LY', 'DA_XAC_NHAN', 'DANG_DONG_GOI', 'DANG_GIAO', 'DA_HOAN_THANH', 'DA_HUY') DEFAULT 'CHO_XU_LY',
        ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_nhan_vien) REFERENCES nhan_vien(id),
        INDEX (ma_don),
        INDEX (trang_thai),
        INDEX (ngay_dat)
      ) ENGINE=InnoDB;
    `);

    // ChiTietDonHangOnline (Online Order Detail)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chi_tiet_don_hang_online (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_don_hang INT NOT NULL,
        id_hang_hoa INT NOT NULL,
        gia_ban DECIMAL(12, 0),
        so_luong INT,
        thanh_tien DECIMAL(12, 0),
        FOREIGN KEY (id_don_hang) REFERENCES don_hang_online(id),
        FOREIGN KEY (id_hang_hoa) REFERENCES hang_hoa(id)
      ) ENGINE=InnoDB;
    `);

    console.log('✅ All tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

module.exports = { ensureTables };
