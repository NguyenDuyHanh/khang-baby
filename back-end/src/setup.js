const pool = require('./db');

async function ensureTables() {
  try {
    // 1. Create compatibility helper functions in PostgreSQL
    await pool.query(`
      CREATE OR REPLACE FUNCTION date(val timestamp) RETURNS date AS $$
      BEGIN
        RETURN val::date;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `);

    await pool.query(`
      CREATE OR REPLACE FUNCTION date(val timestamp with time zone) RETURNS date AS $$
      BEGIN
        RETURN val::date;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `);

    await pool.query(`
      CREATE OR REPLACE FUNCTION date(val text) RETURNS date AS $$
      BEGIN
        RETURN val::date;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `);

    await pool.query(`
      CREATE OR REPLACE FUNCTION date(val date) RETURNS date AS $$
      BEGIN
        RETURN val;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `);

    await pool.query(`
      CREATE OR REPLACE FUNCTION curdate() RETURNS date AS $$
      BEGIN
        RETURN CURRENT_DATE;
      END;
      $$ LANGUAGE plpgsql STABLE;
    `);

    await pool.query(`
      CREATE OR REPLACE FUNCTION datediff(val1 timestamp, val2 timestamp) RETURNS integer AS $$
      BEGIN
        RETURN (val1::date - val2::date);
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `);

    await pool.query(`
      CREATE OR REPLACE FUNCTION datediff(val1 date, val2 date) RETURNS integer AS $$
      BEGIN
        RETURN (val1 - val2);
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `);

    console.log('✅ PostgreSQL compatibility functions verified/created');

    // 2. NhanVien (Staff)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS nhan_vien (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        ho_ten VARCHAR(255) NOT NULL,
        so_dien_thoai VARCHAR(20),
        vai_tro VARCHAR(50) CHECK (vai_tro IN ('MANAGER', 'WAREHOUSE', 'SALES', 'ONLINE_SALES', 'MARKETING', 'CUSTOMER')) NOT NULL,
        trang_thai VARCHAR(50) DEFAULT 'HOAT_DONG' CHECK (trang_thai IN ('HOAT_DONG', 'KHOA')),
        ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. DanhMuc (Product Categories)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS danh_muc (
        id SERIAL PRIMARY KEY,
        ten_danh_muc VARCHAR(255) NOT NULL UNIQUE,
        mo_ta TEXT,
        trang_thai VARCHAR(50) DEFAULT 'HOAT_DONG' CHECK (trang_thai IN ('HOAT_DONG', 'KHONG_HOAT_DONG')),
        ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. NhaCungCap (Supplier)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS nha_cung_cap (
        id SERIAL PRIMARY KEY,
        ten_ncc VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255),
        so_dien_thoai VARCHAR(20),
        dia_chi TEXT,
        trang_thai VARCHAR(50) DEFAULT 'HOAT_DONG' CHECK (trang_thai IN ('HOAT_DONG', 'KHONG_HOAT_DONG')),
        ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. HangHoa (Products)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hang_hoa (
        id SERIAL PRIMARY KEY,
        ma_sp VARCHAR(50) NOT NULL UNIQUE,
        ten_sp VARCHAR(255) NOT NULL,
        id_danh_muc INT NOT NULL REFERENCES danh_muc(id),
        id_nha_cung_cap INT NOT NULL REFERENCES nha_cung_cap(id),
        don_vi_tinh VARCHAR(50) DEFAULT 'HOP' CHECK (don_vi_tinh IN ('HOP', 'GOI', 'CHIEC', 'THUNG', 'LON')),
        gia_nhap DECIMAL(12, 0) NOT NULL,
        gia_ban DECIMAL(12, 0) NOT NULL,
        ton_kho INT DEFAULT 0,
        ton_kho_toi_thieu INT DEFAULT 10,
        han_su_dung DATE,
        ngay_nhap_batch DATE,
        hinh_anh VARCHAR(255),
        trang_thai VARCHAR(50) DEFAULT 'HOAT_DONG' CHECK (trang_thai IN ('HOAT_DONG', 'NGUNG_KD')),
        ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_hang_hoa_ma_sp ON hang_hoa(ma_sp);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_hang_hoa_ten_sp ON hang_hoa(ten_sp);`);

    // 6. Voucher
    await pool.query(`
      CREATE TABLE IF NOT EXISTS voucher (
        id SERIAL PRIMARY KEY,
        ma_voucher VARCHAR(50) NOT NULL UNIQUE,
        gia_tri_giam DECIMAL(12, 0),
        phan_tram_giam INT,
        so_lan_su_dung INT DEFAULT 0,
        so_lan_su_dung_toi_da INT,
        gia_toi_thieu DECIMAL(12, 0),
        han_su_dung_tu DATE NOT NULL,
        han_su_dung_den DATE NOT NULL,
        danh_muc_ap_dung VARCHAR(255),
        trang_thai VARCHAR(50) DEFAULT 'HOAT_DONG' CHECK (trang_thai IN ('HOAT_DONG', 'KHONG_HOAT_DONG')),
        ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. HoaDonBan (Sales Invoice - POS)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hoa_don_ban (
        id SERIAL PRIMARY KEY,
        ma_hdb VARCHAR(50) NOT NULL UNIQUE,
        ngay_ban TIMESTAMP NOT NULL,
        id_nhan_vien INT NOT NULL REFERENCES nhan_vien(id),
        id_khach_hang INT,
        ten_khach_hang VARCHAR(255),
        ma_voucher VARCHAR(50),
        tong_tien_hang DECIMAL(12, 0),
        tien_giam DECIMAL(12, 0) DEFAULT 0,
        tong_can_thanh_toan DECIMAL(12, 0),
        phuong_thuc_thanh_toan VARCHAR(50) DEFAULT 'TIEN_MAT' CHECK (phuong_thuc_thanh_toan IN ('TIEN_MAT', 'CHUYEN_KHOAN', 'QUET_THE')),
        trang_thai VARCHAR(50) DEFAULT 'CHO_XAC_NHAN' CHECK (trang_thai IN ('CHO_XAC_NHAN', 'CHUA_THANH_TOAN', 'DA_THANH_TOAN', 'DA_HUY')),
        ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_hoa_don_ban_ma_hdb ON hoa_don_ban(ma_hdb);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_hoa_don_ban_ngay_ban ON hoa_don_ban(ngay_ban);`);

    // 8. ChiTietHoaDonBan (Sales Invoice Detail)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chi_tiet_hoa_don_ban (
        id SERIAL PRIMARY KEY,
        id_hoa_don INT NOT NULL REFERENCES hoa_don_ban(id) ON DELETE CASCADE,
        id_hang_hoa INT NOT NULL REFERENCES hang_hoa(id),
        gia_ban DECIMAL(12, 0),
        so_luong INT,
        thanh_tien DECIMAL(12, 0)
      );
    `);

    // 9. PhieuNhapHang (Receipt Invoice)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS phieu_nhap_hang (
        id SERIAL PRIMARY KEY,
        ma_pnh VARCHAR(50) NOT NULL UNIQUE,
        ngay_nhap TIMESTAMP NOT NULL,
        id_nha_cung_cap INT NOT NULL REFERENCES nha_cung_cap(id),
        id_nhan_vien INT NOT NULL REFERENCES nhan_vien(id),
        so_luong_dat INT,
        so_luong_thuc_nhan INT,
        con_thieu INT DEFAULT 0,
        trang_thai_thanh_toan VARCHAR(50) DEFAULT 'CHUA_THANH_TOAN_HET' CHECK (trang_thai_thanh_toan IN ('DA_THANH_TOAN_HET', 'CHUA_THANH_TOAN_HET')),
        tong_tien DECIMAL(12, 0),
        ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_phieu_nhap_hang_ma_pnh ON phieu_nhap_hang(ma_pnh);`);

    // 10. ChiTietPhieuNhap (Receipt Invoice Detail)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chi_tiet_phieu_nhap (
        id SERIAL PRIMARY KEY,
        id_phieu_nhap INT NOT NULL REFERENCES phieu_nhap_hang(id) ON DELETE CASCADE,
        id_hang_hoa INT NOT NULL REFERENCES hang_hoa(id),
        gia_nhap DECIMAL(12, 0),
        so_luong INT,
        ngay_san_xuat DATE,
        han_su_dung DATE,
        thanh_tien DECIMAL(12, 0)
      );
    `);

    // 11. DonHangOnline (Online Orders)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS don_hang_online (
        id SERIAL PRIMARY KEY,
        ma_don VARCHAR(50) NOT NULL UNIQUE,
        ngay_dat TIMESTAMP NOT NULL,
        ten_khach_hang VARCHAR(255) NOT NULL,
        so_dien_thoai VARCHAR(20) NOT NULL,
        dia_chi_giao VARCHAR(500) NOT NULL,
        ghi_chu_don TEXT,
        kenh_dat_hang VARCHAR(50) DEFAULT 'WEBSITE' CHECK (kenh_dat_hang IN ('FACEBOOK', 'WEBSITE', 'ZALO')),
        id_nhan_vien INT REFERENCES nhan_vien(id),
        ma_voucher VARCHAR(50),
        don_vi_van_chuyen VARCHAR(255),
        phi_giao_hang DECIMAL(12, 0) DEFAULT 0,
        ngay_giao_du_kien DATE,
        ma_van_don VARCHAR(100),
        tong_tien_hang DECIMAL(12, 0),
        tien_giam DECIMAL(12, 0) DEFAULT 0,
        tong_thanh_toan DECIMAL(12, 0),
        phuong_thuc_thanh_toan VARCHAR(50) DEFAULT 'COD' CHECK (phuong_thuc_thanh_toan IN ('COD', 'CHUYEN_KHOAN')),
        trang_thai VARCHAR(50) DEFAULT 'CHO_XU_LY' CHECK (trang_thai IN ('CHO_XU_LY', 'DA_XAC_NHAN', 'DANG_DONG_GOI', 'DANG_GIAO', 'DA_HOAN_THANH', 'DA_HUY', 'KHACH_DA_NHAN', 'KHIEU_NAI')),
        ly_do_khieu_nai TEXT,
        ngay_giao_hang TIMESTAMP,
        ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`ALTER TABLE don_hang_online ADD COLUMN IF NOT EXISTS ngay_giao_hang TIMESTAMP;`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_don_hang_online_ma_don ON don_hang_online(ma_don);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_don_hang_online_trang_thai ON don_hang_online(trang_thai);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_don_hang_online_ngay_dat ON don_hang_online(ngay_dat);`);

    // 12. ChiTietDonHangOnline (Online Order Detail)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chi_tiet_don_hang_online (
        id SERIAL PRIMARY KEY,
        id_don_hang INT NOT NULL REFERENCES don_hang_online(id) ON DELETE CASCADE,
        id_hang_hoa INT NOT NULL REFERENCES hang_hoa(id),
        gia_ban DECIMAL(12, 0),
        so_luong INT,
        thanh_tien DECIMAL(12, 0)
      );
    `);

    // 13. PhieuPhanHoiHangThieu (Missing Items Feedback)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS phieu_phan_hoi_hang_thieu (
        id SERIAL PRIMARY KEY,
        ma_phht VARCHAR(50) NOT NULL UNIQUE,
        id_nhan_vien INT NOT NULL REFERENCES nhan_vien(id),
        id_phieu_nhap INT NOT NULL REFERENCES phieu_nhap_hang(id) ON DELETE CASCADE,
        ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        tong_thieu_hut DECIMAL(12, 0) DEFAULT 0
      );
    `);

    // 14. ChiTietPhieuPhanHoi (Missing Items Feedback Detail)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chi_tiet_phieu_phan_hoi (
        id SERIAL PRIMARY KEY,
        id_phieu_phan_hoi INT NOT NULL REFERENCES phieu_phan_hoi_hang_thieu(id) ON DELETE CASCADE,
        id_hang_hoa INT NOT NULL REFERENCES hang_hoa(id),
        so_luong_thieu_hut INT NOT NULL,
        gia_tri_thieu_hut DECIMAL(12, 0) NOT NULL
      );
    `);

    // 15. PhieuTraHang (Return Voucher)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS phieu_tra_hang (
        id SERIAL PRIMARY KEY,
        ma_pth VARCHAR(50) NOT NULL UNIQUE,
        id_phieu_nhap INT NOT NULL REFERENCES phieu_nhap_hang(id) ON DELETE CASCADE,
        id_nhan_vien INT NOT NULL REFERENCES nhan_vien(id),
        ngay_tra TIMESTAMP NOT NULL,
        ly_do VARCHAR(500)
      );
    `);

    // 16. ChiTietPhieuTra (Return Voucher Detail)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chi_tiet_phieu_tra (
        id SERIAL PRIMARY KEY,
        id_phieu_tra INT NOT NULL REFERENCES phieu_tra_hang(id) ON DELETE CASCADE,
        id_hang_hoa INT NOT NULL REFERENCES hang_hoa(id),
        so_luong_tra INT NOT NULL,
        gia_nhap DECIMAL(12, 0) NOT NULL
      );
    `);

    console.log('✅ All PostgreSQL tables and indexes verified/created successfully');

    // Auto-seed mock data if tables are empty
    const { seedDatabase } = require('./services/seederService');
    await seedDatabase();
  } catch (error) {
    console.error('❌ Error creating database schema:', error);
    throw error;
  }
}

module.exports = { ensureTables };
