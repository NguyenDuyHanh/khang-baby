const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '12345678',
  database: 'khang_baby'
});

const generateId = (index) => `SP-MOCK-${Date.now().toString().slice(-4)}-${String(index).padStart(4, '0')}`;

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const prefixes = ['Cao cấp', 'Chính hãng', 'Nhập khẩu', 'Organic', 'Siêu sạch', 'Tiện dụng', 'Đa năng', 'Mới nhất'];
const donViTinh = ['HOP', 'GOI', 'CHIEC', 'THUNG', 'LON'];

async function seed() {
  try {
    const { rows: categories } = await pool.query('SELECT id, ten_danh_muc FROM danh_muc');
    const { rows: suppliers } = await pool.query('SELECT id FROM nha_cung_cap');
    
    if (categories.length === 0 || suppliers.length === 0) {
      console.log('Error: Missing categories or suppliers in DB.');
      process.exit(1);
    }
    
    let totalInserted = 0;

    for (const category of categories) {
      console.log(`Seeding 15 products for category: ${category.ten_danh_muc}`);
      for (let i = 1; i <= 15; i++) {
        const ma_sp = generateId(totalInserted + 1);
        const prefix = getRandomElement(prefixes);
        const ten_sp = `Sản phẩm ${prefix} - ${category.ten_danh_muc} - Mã ${i}`;
        const id_danh_muc = category.id;
        const id_nha_cung_cap = getRandomElement(suppliers).id;
        const unit = getRandomElement(donViTinh);
        const gia_nhap = getRandomInt(10, 500) * 1000;
        const gia_ban = Math.floor(gia_nhap * (1 + getRandomInt(15, 40) / 100)); // 15% - 40% margin
        const ton_kho = getRandomInt(0, 500);
        const ton_kho_toi_thieu = getRandomInt(5, 50);
        
        // Random date between 6 months from now to 3 years from now
        const expDate = new Date();
        expDate.setMonth(expDate.getMonth() + getRandomInt(6, 36));
        const han_su_dung = expDate.toISOString().split('T')[0];

        await pool.query(
          `INSERT INTO hang_hoa (ma_sp, ten_sp, id_danh_muc, id_nha_cung_cap, don_vi_tinh, gia_nhap, gia_ban, ton_kho, ton_kho_toi_thieu, han_su_dung, trang_thai)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [ma_sp, ten_sp, id_danh_muc, id_nha_cung_cap, unit, gia_nhap, gia_ban, ton_kho, ton_kho_toi_thieu, han_su_dung, 'HOAT_DONG']
        );
        totalInserted++;
      }
    }
    
    console.log(`Successfully seeded ${totalInserted} products!`);
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await pool.end();
  }
}

seed();
