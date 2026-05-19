const pool = require('../db');

async function seedDatabase() {
  console.log('🌱 Starting database seeder check...');

  // Get a valid nhan_vien ID to reference for foreign keys
  const [employees] = await pool.query('SELECT id FROM nhan_vien LIMIT 1');
  let employeeId = null;
  
  if (employees.length > 0) {
    employeeId = employees[0].id;
  } else {
    // If absolutely no employees exist, create a fallback manager so foreign keys don't crash
    console.log('⚠️ No nhan_vien found. Creating a fallback MANAGER to fulfill foreign key constraints.');
    const [result] = await pool.query(
      `INSERT INTO nhan_vien (email, password, ho_ten, so_dien_thoai, vai_tro, trang_thai)
       VALUES ('admin@khangbaby.com', '$2b$10$fallbackhash', 'Quản trị viên Khang Baby', '0912345678', 'MANAGER', 'HOAT_DONG')`
    );
    employeeId = result.insertId;
  }

  // 1. Danh Muc (Categories) - seed 20 items
  const [catCheck] = await pool.query('SELECT COUNT(*) as count FROM danh_muc');
  if (Number(catCheck[0].count) === 0) {
    console.log('🌱 Seeding 20 categories into danh_muc...');
    const categories = [
      ['Sữa Bột', 'Sữa bột công thức cho bé từ sơ sinh đến 6 tuổi'],
      ['Sữa Nước', 'Sữa pha sẵn tiện lợi cho bé mang đi học, đi chơi'],
      ['Tã Bỉm Dán', 'Bỉm dán siêu thấm hút cho bé sơ sinh và trẻ nhỏ'],
      ['Tã Bỉm Quần', 'Bỉm quần mềm mại co giãn cho bé tập đi'],
      ['Đồ Ăn Dặm', 'Bột ăn dặm, bánh ăn dặm dinh dưỡng'],
      ['Bình Sữa & Phụ Kiện', 'Bình sữa PPSU, núm ti silicon, cọ rửa bình'],
      ['Đồ Chơi Sơ Sinh', 'Kệ chữ A, xúc xắc, đồ chơi treo nôi'],
      ['Đồ Chơi Giáo Dục', 'Xếp hình lego, bảng vẽ nam châm, sách vải'],
      ['Quần Áo Sơ Sinh', 'Quần áo 100% cotton organic siêu mềm mát'],
      ['Giày Dép Trẻ Em', 'Giày tập đi đế mềm, dép quai hậu chống trơn trượt'],
      ['Xe Đẩy & Địu Em Bé', 'Xe đẩy gấp gọn du lịch, địu 4 tư thế giảm tải'],
      ['Ghế Ăn Dặm', 'Ghế ăn dặm điều chỉnh độ cao chống đổ'],
      ['Tắm & Chăm Sóc Da', 'Sữa tắm gội 2in1 dịu nhẹ, kem chống hăm, dầu tràm'],
      ['Vitamin & Thực Phẩm Chức Năng', 'DHA, D3 K2 tinh khiết, men vi sinh 10 chủng'],
      ['Đồ Dùng Phòng Ngủ', 'Nệm cao su non, chũn cuốn ngủ ngon, gối chống trào'],
      ['Máy Cầm Tay Mẹ & Bé', 'Máy hút sữa rảnh tay, máy hâm sữa 3in1, máy tiệt trùng UV'],
      ['Giấy Ướt & Giấy Khô', 'Khăn ướt không mùi dịu nhẹ cho làn da nhạy cảm'],
      ['Khẩu Trang & Vệ Sinh', 'Khẩu trang 3D cho bé, nước rửa tay organic'],
      ['Pha lê & Đồ dùng ăn uống', 'Khay ăn dặm silicon chia ngăn, thìa báo nóng'],
      ['Sách & Truyện Tranh', 'Truyện tranh ehon Nhật Bản cho bé kích thích não bộ']
    ];

    for (const [name, desc] of categories) {
      await pool.query(
        'INSERT INTO danh_muc (ten_danh_muc, mo_ta, trang_thai) VALUES (?, ?, ?)',
        [name, desc, 'HOAT_DONG']
      );
    }
  }

  // 2. Nha Cung Cap (Suppliers) - seed 20 items
  const [supCheck] = await pool.query('SELECT COUNT(*) as count FROM nha_cung_cap');
  if (Number(supCheck[0].count) === 0) {
    console.log('🌱 Seeding 20 suppliers into nha_cung_cap...');
    const suppliers = [
      ['Công ty TNHH Nestlé Việt Nam', 'nestle@contact.vn', '02839113700', 'KCN Biên Hòa II, Đồng Nai'],
      ['Công ty TNHH Abbott Nutrition Việt Nam', 'abbott@contact.vn', '02438250300', 'Mê Linh Point Tower, Quận 1, TP. HCM'],
      ['Công ty Cổ phần Diana Unicharm', 'unicharm@contact.vn', '02436445758', 'KCN Vĩnh Tuy, Lĩnh Nam, Hoàng Mai, Hà Nội'],
      ['Công ty TNHH Kimberly-Clark Việt Nam', 'huggies@contact.vn', '02837402500', 'KCN VSIP, Thuận An, Bình Dương'],
      ['Công ty TNHH Pigeon Việt Nam', 'pigeon@contact.vn', '02838220300', 'KCN Tân Bình, Tân Phú, TP. HCM'],
      ['Công ty Cổ phần Bột giặt LIX', 'lix@contact.vn', '02838966803', 'KCN Linh Trung, Thủ Đức, TP. HCM'],
      ['Công ty TNHH Farlin Việt Nam', 'farlin@contact.vn', '02839621388', 'Lũy Bán Bích, Tân Phú, TP. HCM'],
      ['Công ty TNHH Sản Xuất Nhựa Song Long', 'songlong@contact.vn', '02438612888', 'Gia Lâm, Hà Nội'],
      ['Công ty Cổ phần Dược phẩm CPC1 Hà Nội', 'cpc1hn@contact.vn', '02432191333', 'KCN Ngọc Hồi, Thanh Trì, Hà Nội'],
      ['Công ty TNHH Phân Phối SnB (Soc&Brothers)', 'snb@contact.vn', '02439335388', 'Quận Hoàn Kiếm, Hà Nội'],
      ['Công ty TNHH Mothercare Việt Nam', 'mothercare@contact.vn', '02873003700', 'Quận 3, TP. HCM'],
      ['Công ty Cổ phần Đồ Chơi An Toàn Việt', 'antoviet@contact.vn', '02462961888', 'KCN Quang Minh, Mê Linh, Hà Nội'],
      ['Công ty Cổ phần May 10', 'may10@contact.vn', '02438276910', 'Sài Đồng, Long Biên, Hà Nội'],
      ['Công ty Cổ phần Giày Thượng Đình', 'thuongdinh@contact.vn', '02438541263', 'Thanh Xuân, Hà Nội'],
      ['Công ty TNHH Aprica Việt Nam', 'aprica@contact.vn', '02838421188', 'Quận 1, TP. HCM'],
      ['Công ty TNHH Chicco Việt Nam', 'chicco@contact.vn', '02437678888', 'Đống Đa, Hà Nội'],
      ['Công ty Cổ phần Dược Mỹ Phẩm KoKo', 'koko@contact.vn', '02436891222', 'Cầu Giấy, Hà Nội'],
      ['Công ty TNHH Giấy Hải Tiến', 'haitien@contact.vn', '02438751555', 'Gia Lâm, Hà Nội'],
      ['Nhà sách Kim Đồng', 'kimdong@contact.vn', '02439434730', 'Quận Hai Bà Trưng, Hà Nội'],
      ['Công ty Cổ phần Phân phối Phát Việt', 'phatviet@contact.vn', '02839485777', 'Quận Tân Bình, TP. HCM']
    ];

    for (const [name, email, phone, addr] of suppliers) {
      await pool.query(
        'INSERT INTO nha_cung_cap (ten_ncc, email, so_dien_thoai, dia_chi, trang_thai) VALUES (?, ?, ?, ?, ?)',
        [name, email, phone, addr, 'HOAT_DONG']
      );
    }
  }

  // Fetch created categories and suppliers
  const [allCats] = await pool.query('SELECT id FROM danh_muc');
  const [allSups] = await pool.query('SELECT id FROM nha_cung_cap');

  // 3. Hang Hoa (Products) - seed 20 items
  const [prodCheck] = await pool.query('SELECT COUNT(*) as count FROM hang_hoa');
  if (Number(prodCheck[0].count) === 0 && allCats.length >= 20 && allSups.length >= 20) {
    console.log('🌱 Seeding 20 products into hang_hoa...');
    const products = [
      ['SP0001', 'Sữa bột NAN Optipro số 1 900g', allCats[0].id, allSups[0].id, 'HOP', 380000, 460000, 50, 10, '2027-12-31'],
      ['SP0002', 'Sữa bột NAN Optipro số 2 900g', allCats[0].id, allSups[0].id, 'HOP', 390000, 470000, 40, 10, '2027-12-31'],
      ['SP0003', 'Sữa bột Similac 5G số 1 900g', allCats[0].id, allSups[1].id, 'HOP', 420000, 510000, 30, 8, '2027-10-15'],
      ['SP0004', 'Sữa bột Similac 5G số 2 900g', allCats[0].id, allSups[1].id, 'HOP', 430000, 520000, 35, 8, '2027-10-15'],
      ['SP0005', 'Bỉm dán Bobby siêu thấm XS-S 80 miếng', allCats[2].id, allSups[2].id, 'GOI', 215000, 275000, 100, 15, '2028-05-01'],
      ['SP0006', 'Bỉm dán Bobby siêu thấm M 76 miếng', allCats[2].id, allSups[2].id, 'GOI', 225000, 285000, 80, 15, '2028-05-01'],
      ['SP0007', 'Bỉm quần Bobby cải tiến L 68 miếng', allCats[3].id, allSups[2].id, 'GOI', 245000, 310000, 120, 20, '2028-06-01'],
      ['SP0008', 'Bỉm dán Huggies Dry S 82 miếng', allCats[2].id, allSups[3].id, 'GOI', 210000, 269000, 90, 15, '2028-04-15'],
      ['SP0009', 'Bỉm quần Huggies Dry XL 62 miếng', allCats[3].id, allSups[3].id, 'GOI', 250000, 320000, 110, 20, '2028-04-15'],
      ['SP0010', 'Bình sữa Pigeon cổ rộng PPSU 160ml', allCats[5].id, allSups[4].id, 'CHIEC', 280000, 360000, 60, 5, null],
      ['SP0011', 'Bình sữa Pigeon cổ rộng PPSU 240ml', allCats[5].id, allSups[4].id, 'CHIEC', 295000, 385000, 55, 5, null],
      ['SP0012', 'Xúc xắc gặm nướu Pigeon hình hoa anh đào', allCats[6].id, allSups[4].id, 'CHIEC', 75000, 110000, 45, 5, null],
      ['SP0013', 'Bột ăn dặm Nestle Cerelac cá cam cà rốt', allCats[4].id, allSups[0].id, 'HOP', 52000, 72000, 80, 10, '2026-11-20'],
      ['SP0014', 'Nước rửa bình sữa Pigeon túi 700ml', allCats[5].id, allSups[4].id, 'GOI', 115000, 155000, 70, 10, '2027-08-30'],
      ['SP0015', 'Nước giặt xả D-nee organic xanh chai 3L', allCats[12].id, allSups[9].id, 'LON', 145000, 195000, 150, 10, '2029-01-01'],
      ['SP0016', 'Khăn ướt Bobby không mùi 100 miếng', allCats[16].id, allSups[2].id, 'GOI', 25000, 38000, 300, 30, '2028-01-01'],
      ['SP0017', 'Kem chống hăm Chicco 3in1 100ml', allCats[12].id, allSups[15].id, 'HOP', 210000, 275000, 40, 5, '2027-06-30'],
      ['SP0018', 'Vitamin D3 K2 LineaBon nhỏ giọt 10ml', allCats[13].id, allSups[8].id, 'HOP', 220000, 295000, 120, 10, '2027-05-15'],
      ['SP0019', 'Ghế ăn dặm Song Long cao cấp plastic', allCats[11].id, allSups[7].id, 'CHIEC', 180000, 260000, 25, 4, null],
      ['SP0020', 'Khẩu trang em bé Song Long 3D hộp 20 cái', allCats[17].id, allSups[7].id, 'HOP', 35000, 55000, 200, 15, '2029-12-31']
    ];

    for (const [sku, name, catId, supId, unit, importPrice, salePrice, stock, minStock, exp] of products) {
      await pool.query(
        `INSERT INTO hang_hoa (ma_sp, ten_sp, id_danh_muc, id_nha_cung_cap, don_vi_tinh, gia_nhap, gia_ban, ton_kho, ton_kho_toi_thieu, han_su_dung, trang_thai)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [sku, name, catId, supId, unit, importPrice, salePrice, stock, minStock, exp, 'HOAT_DONG']
      );
    }
  }

  // Fetch created products
  const [allProds] = await pool.query('SELECT id, gia_ban, gia_nhap FROM hang_hoa');

  // 4. Voucher - seed 20 items
  const [voucherCheck] = await pool.query('SELECT COUNT(*) as count FROM voucher');
  if (Number(voucherCheck[0].count) === 0) {
    console.log('🌱 Seeding 20 vouchers into voucher...');
    for (let i = 1; i <= 20; i++) {
      const code = `VOUCHER${String(i).padStart(3, '0')}`;
      const isPercent = i % 2 === 0;
      const reduceVal = isPercent ? null : 20000 + i * 2000;
      const reducePercent = isPercent ? 5 + (i % 3) * 5 : null;
      const minPrice = 150000 + i * 10000;

      await pool.query(
        `INSERT INTO voucher (ma_voucher, gia_tri_giam, phan_tram_giam, so_lan_su_dung, so_lan_su_dung_toi_da, gia_toi_thieu, han_su_dung_tu, han_su_dung_den, trang_thai)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_DATE - 5, CURRENT_DATE + 30, 'HOAT_DONG')`,
        [code, reduceVal, reducePercent, 0, 100, minPrice]
      );
    }
  }

  // 5. Hoa Don Ban (Sales Invoice - POS) - seed 20 items
  const [hdbCheck] = await pool.query('SELECT COUNT(*) as count FROM hoa_don_ban');
  if (Number(hdbCheck[0].count) === 0 && allProds.length >= 20) {
    console.log('🌱 Seeding 20 sales invoices into hoa_don_ban & details...');
    for (let i = 1; i <= 20; i++) {
      const code = `HDB${String(i).padStart(4, '0')}`;
      const customerName = `Khách hàng POS ${i}`;
      const payMethod = i % 3 === 0 ? 'TIEN_MAT' : i % 3 === 1 ? 'CHUYEN_KHOAN' : 'QUET_THE';
      const status = 'DA_THANH_TOAN';

      // Pick 2 products randomly to buy
      const prod1 = allProds[(i * 3) % allProds.length];
      const prod2 = allProds[(i * 7) % allProds.length];
      const qty1 = 1 + (i % 3);
      const qty2 = 1 + (i % 2);

      const item1Cost = Number(prod1.gia_ban) * qty1;
      const item2Cost = Number(prod2.gia_ban) * qty2;
      const subtotal = item1Cost + item2Cost;
      const reduction = i * 1000;
      const total = subtotal - reduction;

      const [result] = await pool.query(
        `INSERT INTO hoa_don_ban (ma_hdb, ngay_ban, id_nhan_vien, ten_khach_hang, tong_tien_hang, tien_giam, tong_can_thanh_toan, phuong_thuc_thanh_toan, trang_thai)
         VALUES (?, CURRENT_TIMESTAMP - INTERVAL '${i} hour', ?, ?, ?, ?, ?, ?, ?)`,
        [code, employeeId, customerName, subtotal, reduction, total, payMethod, status]
      );

      const invoiceId = result.insertId;

      await pool.query(
        `INSERT INTO chi_tiet_hoa_don_ban (id_hoa_don, id_hang_hoa, gia_ban, so_luong, thanh_tien)
         VALUES (?, ?, ?, ?, ?)`,
        [invoiceId, prod1.id, prod1.gia_ban, qty1, item1Cost]
      );

      await pool.query(
        `INSERT INTO chi_tiet_hoa_don_ban (id_hoa_don, id_hang_hoa, gia_ban, so_luong, thanh_tien)
         VALUES (?, ?, ?, ?, ?)`,
        [invoiceId, prod2.id, prod2.gia_ban, qty2, item2Cost]
      );
    }
  }

  // 6. Phieu Nhap Hang (Receipt Invoice) - seed 20 items
  const [pnhCheck] = await pool.query('SELECT COUNT(*) as count FROM phieu_nhap_hang');
  if (Number(pnhCheck[0].count) === 0 && allSups.length >= 20 && allProds.length >= 20) {
    console.log('🌱 Seeding 20 receipts into phieu_nhap_hang & details...');
    for (let i = 1; i <= 20; i++) {
      const code = `PN${String(i).padStart(4, '0')}`;
      const supplierId = allSups[(i * 3) % allSups.length].id;
      
      const prod1 = allProds[(i * 2) % allProds.length];
      const prod2 = allProds[(i * 5) % allProds.length];
      const qty1 = 50 + i;
      const qty2 = 40 + i * 2;

      const item1Cost = Number(prod1.gia_nhap) * qty1;
      const item2Cost = Number(prod2.gia_nhap) * qty2;
      const total = item1Cost + item2Cost;

      const [result] = await pool.query(
        `INSERT INTO phieu_nhap_hang (ma_pnh, ngay_nhap, id_nha_cung_cap, id_nhan_vien, so_luong_dat, so_luong_thuc_nhan, con_thieu, trang_thai_thanh_toan, tong_tien)
         VALUES (?, CURRENT_TIMESTAMP - INTERVAL '${i} day', ?, ?, ?, ?, 0, 'DA_THANH_TOAN_HET', ?)`,
        [code, supplierId, employeeId, qty1 + qty2, qty1 + qty2, total]
      );

      const receiptId = result.insertId;

      await pool.query(
        `INSERT INTO chi_tiet_phieu_nhap (id_phieu_nhap, id_hang_hoa, gia_nhap, so_luong, ngay_san_xuat, han_su_dung, thanh_tien)
         VALUES (?, ?, ?, ?, CURRENT_DATE - 30, CURRENT_DATE + 365, ?)`,
        [receiptId, prod1.id, prod1.gia_nhap, qty1, item1Cost]
      );

      await pool.query(
        `INSERT INTO chi_tiet_phieu_nhap (id_phieu_nhap, id_hang_hoa, gia_nhap, so_luong, ngay_san_xuat, han_su_dung, thanh_tien)
         VALUES (?, ?, ?, ?, CURRENT_DATE - 30, CURRENT_DATE + 365, ?)`,
        [receiptId, prod2.id, prod2.gia_nhap, qty2, item2Cost]
      );
    }
  }

  // Fetch created receipts
  const [allReceipts] = await pool.query('SELECT id, ma_pnh FROM phieu_nhap_hang');

  // 7. Don Hang Online (Online Orders) - seed 20 items
  const [dhoCheck] = await pool.query('SELECT COUNT(*) as count FROM don_hang_online');
  if (Number(dhoCheck[0].count) === 0 && allProds.length >= 20) {
    console.log('🌱 Seeding 20 online orders into don_hang_online & details...');
    for (let i = 1; i <= 20; i++) {
      const code = `DHO${String(i).padStart(4, '0')}`;
      const customerName = `Khách hàng Online ${i}`;
      const phone = `0903${String(i).padStart(6, '0')}`;
      const address = `${10 + i} Đường Láng, Đống Đa, Hà Nội`;
      const source = i % 3 === 0 ? 'WEBSITE' : i % 3 === 1 ? 'FACEBOOK' : 'ZALO';
      const status = 'DA_HOAN_THANH';

      const prod1 = allProds[(i * 3) % allProds.length];
      const prod2 = allProds[(i * 4) % allProds.length];
      const qty1 = 1 + (i % 2);
      const qty2 = 1;

      const item1Cost = Number(prod1.gia_ban) * qty1;
      const item2Cost = Number(prod2.gia_ban) * qty2;
      const subtotal = item1Cost + item2Cost;
      const shipFee = 30000;
      const total = subtotal + shipFee;

      const [result] = await pool.query(
        `INSERT INTO don_hang_online (ma_don, ngay_dat, ten_khach_hang, so_dien_thoai, dia_chi_giao, ghi_chu_don, kenh_dat_hang, id_nhan_vien, phi_giao_hang, tong_tien_hang, tong_thanh_toan, trang_thai)
         VALUES (?, CURRENT_TIMESTAMP - INTERVAL '${i} day', ?, ?, ?, 'Giao giờ hành chính', ?, ?, ?, ?, ?, ?)`,
        [code, customerName, phone, address, source, employeeId, shipFee, subtotal, total, status]
      );

      const orderId = result.insertId;

      await pool.query(
        `INSERT INTO chi_tiet_don_hang_online (id_don_hang, id_hang_hoa, gia_ban, so_luong, thanh_tien)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, prod1.id, prod1.gia_ban, qty1, item1Cost]
      );

      await pool.query(
        `INSERT INTO chi_tiet_don_hang_online (id_don_hang, id_hang_hoa, gia_ban, so_luong, thanh_tien)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, prod2.id, prod2.gia_ban, qty2, item2Cost]
      );
    }
  }

  // 8. Phieu Phan Hoi Hang Thieu (Feedback) - seed 20 items
  const [phhtCheck] = await pool.query('SELECT COUNT(*) as count FROM phieu_phan_hoi_hang_thieu');
  if (Number(phhtCheck[0].count) === 0 && allReceipts.length >= 20 && allProds.length >= 20) {
    console.log('🌱 Seeding 20 missing feedback sheets into phieu_phan_hoi_hang_thieu & details...');
    for (let i = 1; i <= 20; i++) {
      const code = `PHHT${String(i).padStart(4, '0')}`;
      const receipt = allReceipts[i - 1]; // Link each feedback sheet to a unique receipt
      
      // Get receipt items to declare missing
      const [receiptItems] = await pool.query('SELECT id_hang_hoa, gia_nhap FROM chi_tiet_phieu_nhap WHERE id_phieu_nhap = ?', [receipt.id]);
      
      if (receiptItems.length > 0) {
        const item = receiptItems[0];
        const missingQty = 2 + (i % 3);
        const missingVal = Number(item.gia_nhap);
        const totalMissing = missingQty * missingVal;

        const [result] = await pool.query(
          `INSERT INTO phieu_phan_hoi_hang_thieu (ma_phht, id_nhan_vien, id_phieu_nhap, tong_thieu_hut)
           VALUES (?, ?, ?, ?)`,
          [code, employeeId, receipt.id, totalMissing]
        );

        const feedbackId = result.insertId;

        await pool.query(
          `INSERT INTO chi_tiet_phieu_phan_hoi (id_phieu_phan_hoi, id_hang_hoa, so_luong_thieu_hut, gia_tri_thieu_hut)
           VALUES (?, ?, ?, ?)`,
          [feedbackId, item.id_hang_hoa, missingQty, missingVal]
        );
      }
    }
  }

  // 9. Phieu Tra Hang (Return Voucher) - seed 20 items
  const [pthCheck] = await pool.query('SELECT COUNT(*) as count FROM phieu_tra_hang');
  if (Number(pthCheck[0].count) === 0 && allReceipts.length >= 20 && allProds.length >= 20) {
    console.log('🌱 Seeding 20 return vouchers into phieu_tra_hang & details...');
    for (let i = 1; i <= 20; i++) {
      const code = `PTH${String(i).padStart(4, '0')}`;
      const receipt = allReceipts[i - 1];
      
      const [receiptItems] = await pool.query('SELECT id_hang_hoa, gia_nhap FROM chi_tiet_phieu_nhap WHERE id_phieu_nhap = ?', [receipt.id]);

      if (receiptItems.length > 0) {
        const item = receiptItems[0];
        const returnQty = 1 + (i % 2);

        const [result] = await pool.query(
          `INSERT INTO phieu_tra_hang (ma_pth, id_phieu_nhap, id_nhan_vien, ngay_tra, ly_do)
           VALUES (?, ?, ?, CURRENT_TIMESTAMP - INTERVAL '${i} hour', 'Hàng lỗi móp méo vỏ hộp')`,
          [code, receipt.id, employeeId]
        );

        const returnId = result.insertId;

        await pool.query(
          `INSERT INTO chi_tiet_phieu_tra (id_phieu_tra, id_hang_hoa, so_luong_tra, gia_nhap)
           VALUES (?, ?, ?, ?)`,
          [returnId, item.id_hang_hoa, returnQty, item.gia_nhap]
        );
      }
    }
  }

  console.log('✅ Mock data checked and seeded successfully! Excellent!');
}

module.exports = { seedDatabase };
