const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '12345678',
  database: 'khang_baby'
});

const productData = {
  "Sữa Bột": [
    "Aptamil (Anh/Đức/Úc)", "Meiji (Nhật Bản)", "Enfamil A+", "Similac Neosure", "Frisolac Gold", "Glico Icreo", "Hikid (Hàn Quốc)", "ColosBaby", "Morinaga", "PediaSure BA"
  ],
  "Sữa Nước": [
    "Sữa pha sẵn PediaSure", "Sữa pha sẵn Grow Plus+ (Nutifood)", "Sữa pha sẵn Similac dòng lòng vàng", "Sữa pha sẵn Optimum Gold", "Sữa pha sẵn ColosBaby", "Sữa tươi tiệt trùng TH True Milk Formula", "Sữa pha sẵn Meiji Ready to Drink", "Sữa pha sẵn EnfaGrow", "Sữa pha sẵn Famna", "Sữa pha sẵn NuVi"
  ],
  "Tã Bỉm Dán": [
    "Tã dán Huggies Skin Perfect", "Tã dán Bobby Extra Soft-Dry", "Tã dán Pampers Premium Care", "Tã dán Moony Natural (bông hữu cơ)", "Tã dán Merries nội địa Nhật", "Tã dán Goon Friend", "Tã dán Genki Premium", "Tã dán Applecrumby (tã cao cấp)", "Tã dán Momo Diamond", "Tã dán Jo NewBorn"
  ],
  "Tã Bỉm Quần": [
    "Tã quần Bobby Lõi nén thần kỳ", "Tã quần Huggies Platinum", "Tã quần Moony Man", "Tã quần Merries Jumbo", "Tã quần Pampers Giữ dáng chống xệ", "Tã quần Goon Premium", "Tã quần Elibell", "Tã quần Nabizam", "Tã quần Supdry", "Tã quần AnyDry"
  ],
  "Đồ Ăn Dặm": [
    "Bột ăn dặm Heinz", "Bột ăn dặm Hipp Organic", "Bánh ăn dặm Gerber hình ngôi sao", "Bánh gạo ăn dặm Pigeon", "Mì Mug Nissin Nhật Bản", "Ruốc cá hồi sấy Maruha Nhật Bản", "Dầu ăn dặm Thuyền Xưa (Óc chó/Olive)", "Phô mai tách muối Seoul Milk", "Cháo tươi đóng gói Sài Gòn Food", "Váng sữa Monte"
  ],
  "Bình Sữa & Phụ Kiện": [
    "Bình sữa Pigeon thần thánh (thủy tinh/PPSU)", "Bình sữa Hegen", "Bình sữa Philips Avent Natural", "Bình sữa Kamidi (silicon siêu mềm)", "Bình sữa Moyuum Hàn Quốc", "Núm ti thay thế Moyuum/Pigeon các size", "Cọ rửa bình sữa silicon Moaz BéBé", "Nước rửa bình sữa D-nee", "Giá úp bình sữa có nắp đậy", "Túi trữ sữa Sunmum"
  ],
  "Đồ Chơi Sơ Sinh": [
    "Kệ chữ A phát nhạc", "Xúc xắc (lục lạc) cầm tay Konig Kids", "Đồ chơi treo nôi tự xoay Fisher-Price", "Thảm nhạc cho bé nằm chơi", "Sách vải tương tác sột soạt Lalala Baby", "Bóng vải kích thích thị giác", "Thẻ đen trắng kích thích thị giác sơ sinh", "Gặm nướu hình hươu cao cổ", "Thỏ phát nhạc rèn luyện thính giác Alilo", "Đồ chơi lên dây cót thả bồn tắm"
  ],
  "Đồ Chơi Giáo Dục": [
    "Bộ xếp hình Lego Duplo (mảnh to cho bé)", "Bảng vẽ nam châm tự xóa thông minh", "Bộ thẻ học Flashcard Glenn Doman", "Đồ chơi luồn hạt gỗ phát triển vận động tinh", "Sách âm thanh (Sound book) Đinh Tị", "Bộ đồ chơi nấu ăn bằng gỗ", "Khối rubik và hình khối logic cho bé", "Đồ chơi rút gỗ thông minh", "Bảng chữ cái và số bằng gỗ nổi", "Bộ lắp ráp kỹ thuật thông minh"
  ],
  "Quần Áo Sơ Sinh": [
    "Bộ quần áo Nous cài lệch sợi tre", "Body suit Nous dài tay", "Quần áo sơ sinh hữu cơ Chaang", "Bộ cộc tay Lullaby cotton organic", "Bao tay bao chân Mio Mio", "Quần áo sơ sinh Uala Rogo", "Body suit Carter's", "Khăn quấn nhộng chũn Cocoon", "Áo gile giữ ấm BU Baby", "Mũ thóp cho trẻ sơ sinh Dokma"
  ],
  "Giày Dép Trẻ Em": [
    "Giày tập đi đế mềm Attipas", "Sandal chống trượt tập đi Uala Rogo", "Giày thể thao trẻ em Biti's Kids", "Dép sục Crocs Kid", "Giày búp bê bé gái Royale Baby", "Giày lười tập đi Dokma", "Sandal tập đi bít mũi Crown Space", "Giày tập đi Combi Nhật Bản", "Dép tập đi phát tiếng chíp chíp", "Ủng đi mưa giữ ấm cho bé"
  ],
  "Xe Đẩy & Địu Em Bé": [
    "Xe đẩy gấp gọn Baobaohao V5B/V8", "Xe đẩy Aprica Karoon Air (siêu nhẹ)", "Xe đẩy Combi Mechacal Handy", "Xe đẩy Chilux S19 đa năng", "Địu ngồi 4 tư thế AiMama", "Địu vải rảnh tay Ergobaby", "Địu em bé Aprica Pitta", "Địu chống gù Forb Dorothy", "Xe đẩy du lịch siêu nhẹ Voovo", "Xe đẩy nôi bập bênh Belecoo"
  ],
  "Ghế Ăn Dặm": [
    "Ghế ăn dặm Hanbei (thay đổi độ cao)", "Ghế ăn dặm Chilux Grow", "Ghế ăn dặm Mastela 1015 nâng hạ độ cao", "Ghế ăn dặm bằng gỗ IQ Toys", "Ghế ăn dặm gấp gọn Carter's", "Ghế ăn dặm chân cao Joie Multipli", "Ghế ăn dặm Newber đa năng", "Ghế ăn dặm Umoo Hàn Quốc", "Ghế ăn dặm Bonbebe", "Ghế ăn dặm Apramo Flippa (du lịch)"
  ],
  "Tắm & Chăm Sóc Da": [
    "Sữa tắm gội 2in1 Cetaphil Baby", "Sữa tắm gội Lactacyd Milky", "Kem chống hăm Sudocrem", "Kem dưỡng ẩm Aquaphor Baby / Dexeryl", "Dầu tràm đặc biệt Bé Thơ", "Sữa tắm gội thảo dược Elemis", "Kem bôi dịu da muỗi đốt Kutieskin", "Kem chống nắng cho bé Skin Aqua Kids", "Tinh dầu đuổi muỗi Chicco", "Phấn rôm dạng nước Pigeon"
  ],
  "Vitamin & Thực Phẩm Chức Năng": [
    "Vitamin D3 K2 Lineabon", "DHA Drops Nature's Way", "Men vi sinh 10 chủng BioAmicus", "Canxi sữa Healthy Care Kid", "Sắt nhỏ giọt Ferrolip Baby", "Men vi sinh BioGaia Protectis", "Kẽm hữu cơ Biolizin cho bé", "Vitamin tổng hợp Pentavite", "Siro tăng đề kháng Sambucol", "Siro ăn ngon Baby Plus"
  ],
  "Máy Cầm Tay Mẹ & Bé": [
    "Máy hút sữa rảnh tay không dây Fatzbaby", "Máy hâm sữa và tiệt trùng 3in1 Moaz BéBé", "Máy tiệt trùng sấy khô UV-C Fatzbaby King", "Máy đun nước pha sữa giữ nhiệt Chilux", "Máy hút mũi tự động cầm tay Little Bees", "Máy xay ăn dặm cầm tay Bear", "Tông đơ cắt tóc chống ồn cho bé Misuta", "Máy giặt mini sấy khô chuyên dụng cho bé Calofa", "Máy làm sữa hạt mini Momscook", "Máy sưởi gốm nhà tắm cho bé Moaz BéBé"
  ],
  "Giấy Ướt & Giấy Khô": [
    "Khăn ướt không mùi Mamamy", "Khăn ướt Bobby không mùi cho da nhạy cảm", "Khăn vải khô đa năng Likado", "Giấy ướt Moony Nhật Bản", "Khăn khô đa năng Hipgig", "Khăn ướt Agi Hàn Quốc", "Giấy khô sợi tre thấm hút Goodry", "Khăn ướt Kinkin cao cấp", "Khăn giấy khô nén viên kẹo du lịch", "Giấy ướt dịu nhẹ Huggies"
  ],
  "Khẩu Trang & Vệ Sinh": [
    "Khẩu trang 3D kháng khuẩn cho bé Pigeon", "Khẩu trang 3D Unicharm Kid", "Nước rửa tay bọt hữu cơ Lamoon", "Nước muối sinh lý kháng viêm Physiodose", "Gạc rơ lưỡi thảo dược Dr. Papie", "Tăm bông ngoáy tai người lớn trẻ em Life", "Dung dịch sát khuẩn tay nhanh Green Cross trẻ em", "Xịt sát khuẩn diệt khuẩn Babyganics", "Bộ dụng cụ cắt móng tay an toàn cho bé sơ sinh", "Khăn lau hạ sốt Dr. Papie"
  ],
  "Pha lê & Đồ dùng ăn uống": [
    "Khay ăn dặm silicon chia ngăn có đế hút Bluemama", "Thìa ăn dặm silicon báo nóng chuyên dụng", "Bát ăn dặm chống lật Moyuum", "Bộ bát thìa lúa mạch chịu nhiệt", "Cốc tập hút chống sặc Richell Nhật Bản", "Bình tập uống nước chống đổ TGM Hàn Quốc", "Bộ dao kéo thớt chế biến ăn dặm cho bé Misuta", "Yếm ăn dặm silicon có máng hứng sạch sẽ", "Hộp chia sữa 3 tầng tiện lợi khi ra ngoài", "Đũa tập ăn xỏ ngón Edison cho bé"
  ]
};

async function importProducts() {
  try {
    let totalUpdated = 0;
    
    // Get categories to map IDs
    const { rows: categories } = await pool.query('SELECT id, ten_danh_muc FROM danh_muc');
    
    for (const cat of categories) {
      const targetList = productData[cat.ten_danh_muc];
      if (targetList && targetList.length > 0) {
        // Fetch existing products for this category to update them
        const { rows: products } = await pool.query(
          'SELECT id FROM hang_hoa WHERE id_danh_muc = $1 ORDER BY id ASC',
          [cat.id]
        );
        
        // Update the existing products sequentially with names from the user's list
        for (let i = 0; i < targetList.length; i++) {
          if (products[i]) {
            await pool.query('UPDATE hang_hoa SET ten_sp = $1 WHERE id = $2', [targetList[i], products[i].id]);
            totalUpdated++;
          } else {
            // If there are fewer products in DB than in the list, we could insert, but DB currently has 15 items per cat.
            // Let's insert new if missing
            const ma_sp = `SP-${cat.id}-${Date.now().toString().slice(-4)}-${i}`;
            await pool.query(
              `INSERT INTO hang_hoa (ma_sp, ten_sp, id_danh_muc, don_vi_tinh, gia_nhap, gia_ban, ton_kho, ton_kho_toi_thieu, trang_thai)
               VALUES ($1, $2, $3, 'CHIEC', 100000, 150000, 100, 10, 'HOAT_DONG')`,
              [ma_sp, targetList[i], cat.id]
            );
            totalUpdated++;
          }
        }
      }
    }
    console.log(`Successfully updated/inserted ${totalUpdated} products according to the provided list.`);
  } catch (error) {
    console.error('Import error:', error);
  } finally {
    await pool.end();
  }
}

importProducts();
