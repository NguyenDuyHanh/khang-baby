const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '12345678',
  database: 'khang_baby'
});

async function updateImages() {
  try {
    const { rows: products } = await pool.query('SELECT id, id_danh_muc FROM hang_hoa WHERE hinh_anh IS NULL');
    
    if (products.length === 0) {
      console.log('No products need image updates.');
      return;
    }
    
    let updated = 0;

    for (const p of products) {
      // Use loremflickr to get stable, baby-related random images
      // Using lock = p.id so the image stays the same for that specific product
      const imgUrl = `https://loremflickr.com/320/320/baby,product?lock=${p.id}`;
      
      await pool.query(
        `UPDATE hang_hoa SET hinh_anh = $1 WHERE id = $2`,
        [imgUrl, p.id]
      );
      updated++;
    }
    
    console.log(`Successfully updated ${updated} products with random internet images!`);
  } catch (error) {
    console.error('Update error:', error);
  } finally {
    await pool.end();
  }
}

updateImages();
