const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '12345678',
  database: 'khang_baby'
});

const realProducts = {
  'Sữa bột': [
    "Sữa Meiji nội địa Nhật số 0 800g",
    "Sữa Aptamil Úc Profutura số 1 900g",
    "Sữa Morinaga số 9 820g",
    "Sữa Blackmores số 2 900g",
    "Sữa Enfamil A+ NeuroPro số 1 400g",
    "Sữa Pediasure BA hương vani 850g",
    "Sữa Glico Icreo số 0 800g",
    "Sữa Frisolac Gold số 2 850g",
    "Sữa ColosBaby Gold 0+ 800g",
    "Sữa Vinamilk Optimum Gold số 3 900g",
    "Sữa Nutifood GrowPLUS+ đỏ 900g",
    "Sữa Hikid Premium Hàn Quốc 600g",
    "Sữa Physiolac Relais số 2 900g",
    "Sữa Meiji thanh số 0 24 thanh",
    "Sữa non ILDong Plus 1 100g"
  ],
  'Bỉm - Tã': [
    "Bỉm quần Merries size L 44 miếng",
    "Bỉm dán Moony xanh size M 64 miếng",
    "Bỉm quần Pamper nội địa Nhật size XL 38",
    "Bỉm dán Huggies Platinum Nature Made S 82",
    "Bỉm quần Bobby Extra Soft size XXL 34",
    "Bỉm dán GOO.N Plus size S 82 miếng",
    "Bỉm quần Genki Premium Soft size L 44",
    "Bỉm dán Unidry siêu mỏng size NB 72",
    "Bỉm quần Jo siêu thấm size M 60 miếng",
    "Bỉm quần Applecrumby Slim size XL 24",
    "Bỉm dán Yubest Night size M 76 miếng",
    "Bỉm quần Nature Love Mere M 60 miếng",
    "Bỉm dán Molfix thiên nhiên size NB 90",
    "Bỉm quần Huggies Skincare size M 76",
    "Bỉm quần Bobby Fresh size L 68 miếng"
  ],
  'Đồ dùng cho bé': [
    "Máy hút sữa điện đôi Spectra 9 Plus",
    "Bình sữa Avent Natural 260ml",
    "Ti giả Moyuum silicon mềm",
    "Máy hâm sữa Fatzbaby FB3002VN",
    "Chậu tắm Elip gấp gọn cho bé",
    "Khăn tắm xô nhăn 6 lớp sợi tre 120x120cm",
    "Nhiệt kế hồng ngoại Microlife NC200",
    "Cọ rửa bình sữa silicon Wesser 3 trong 1",
    "Dụng cụ hút mũi dây Kidsme",
    "Bấm móng tay có kính lúp Kuku",
    "Gối chống trào ngược Monmon",
    "Máy tiệt trùng sấy khô UV Fatzbaby",
    "Xe đẩy gấp gọn Vovo 2 chiều",
    "Ghế rung Joie Dreamer",
    "Khăn sữa Kuku 4 lớp hộp 10 chiếc"
  ],
  'Thời trang em bé': [
    "Bộ cộc tay Nous pettit chui đầu size 3-6M",
    "Bộ dài tay Lullaby vải xô size 6-9M",
    "Áo khoác gió BU Baby mỏng nhẹ",
    "Mũ sơ sinh UalaRogo vải sợi tre",
    "Bao tay bao chân MioMio cotton",
    "Quần đùi chục Bossini 100% cotton",
    "Bộ body chip Carter's set 5 chi tiết",
    "Áo gile len dệt kim Kidsplaza",
    "Bộ thu đông Avaler sợi tre kháng khuẩn",
    "Vớ da chống trượt cho bé tập đi",
    "Áo liền quần (Bodysuit) mùa đông lông cừu",
    "Bộ quần áo cộc tay La Pomme",
    "Áo khoác nỉ bông sơ sinh Kuku",
    "Yếm xô tam giác có cúc bấm",
    "Quần bỉm chống thấm Goodmama"
  ],
  'Ăn dặm - Thực phẩm': [
    "Bánh ăn dặm Gerber hình sao vị chuối",
    "Bột ăn dặm Heinz vị phô mai súp lơ",
    "Nước tương tách muối Ofukuro Nhật Bản 100ml",
    "Ruốc cá hồi Hokkaidou 50g",
    "Dầu óc chó Kunella 100ml Đức",
    "Bánh gạo lứt hữu cơ Alvins vị rau củ",
    "Trà hoa cúc Wakodo cho bé 1 tháng",
    "Bột dashi Pigeon vị rong biển cá bào",
    "Mì Somen tách muối Hakubaku 100g",
    "Bánh xốp sữa chua khô Ivenet",
    "Dầu Oliu Ajinomoto Extra Virgin 200ml",
    "Bột rắc cơm Marumiya Nhật 28g",
    "Hạt nêm tôm thịt Pigeon 50g",
    "Nước ép hoa quả Wakodo vị táo",
    "Bột ăn dặm Ridielac yến mạch sữa 200g"
  ]
};

const defaultProducts = [
  "Kem nẻ Vaseline Viện Bỏng 10g",
  "Nước muối sinh lý Physiodose Pháp 40 ống",
  "Bông tăm y tế Ikami lõi giấy",
  "Sữa tắm gội thảo dược Yaocare baby 250ml",
  "Dầu tràm Huế nguyên chất 100ml",
  "Nước giặt quần áo Kuku 1200ml",
  "Túi trữ sữa Sunmum 50 túi 250ml",
  "Khăn ướt Mamamy không mùi 100 tờ",
  "Bàn chải đánh răng bước 1 Pigeon",
  "Kem đánh răng hương dâu Chicco 50ml",
  "Thau rửa mặt gập gọn cho bé",
  "Sữa tắm gội Cetaphil Baby 400ml",
  "Dầu massage Johnson's Baby 200ml",
  "Kem chống nắng Pigeon SPF50 50g",
  "Nước xịt khuẩn diệt virus Babyganics 473ml"
];

async function updateProducts() {
  try {
    const { rows: products } = await pool.query("SELECT p.id, p.ten_sp, c.ten_danh_muc FROM hang_hoa p JOIN danh_muc c ON p.id_danh_muc = c.id WHERE p.ten_sp LIKE 'Sản phẩm %'");
    
    let updatedCount = 0;
    for (const p of products) {
      let newName = "";
      const catName = p.ten_danh_muc;
      if (realProducts[catName] && realProducts[catName].length > 0) {
        newName = realProducts[catName].pop();
      }
      if (!newName) {
        if (defaultProducts.length > 0) {
          newName = defaultProducts.pop();
        } else {
          newName = p.ten_sp.replace("Sản phẩm", "Hàng hóa thực tế");
        }
      }
      
      await pool.query("UPDATE hang_hoa SET ten_sp = $1 WHERE id = $2", [newName, p.id]);
      updatedCount++;
    }
    console.log(`Updated ${updatedCount} products with specific real names.`);
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

updateProducts();
