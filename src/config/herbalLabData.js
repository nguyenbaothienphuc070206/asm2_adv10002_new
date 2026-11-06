/**
 * Thorakao Herbal Intelligence Lab, Ingredient Passport, Knowledge Academy,
 * Community Lab Challenges & AI Product Innovation Studio Data Configuration.
 *
 * Strictly separates:
 * 1. Traditional Vietnamese Herbal Knowledge
 * 2. Cosmetic Ingredient Function (INCI)
 * 3. Published Peer-Reviewed Scientific Literature
 * 4. Officially Verified Thorakao Product Formulations
 */

export const EXPERIENCE_LAYERS = [
  {
    id: 'discover',
    code: '01 · DISCOVER',
    titleEn: 'Discover Vietnamese Herbal Heritage',
    titleVi: 'Khám phá Di sản Thảo mộc Việt Nam',
    descEn:
      'Explore the 3D Digital Herbal Garden, Herbal Intelligence Lab, and Digital Ingredient Passports with INCI transparency.',
    descVi:
      'Khám phá Vườn Thảo Mộc 3D, Phòng thí nghiệm Trí tuệ Thảo mộc và Hộ chiếu Thành phần INCI minh bạch.',
    ctaLabelEn: 'Explore Herbal Lab & 3D Garden',
    ctaLabelVi: 'Khám phá Phòng Lab & Vườn 3D',
    actionAttr: 'data-go="story"'
  },
  {
    id: 'understand',
    code: '02 · UNDERSTAND',
    titleEn: 'Understand Your Skin with Calibrated AI',
    titleVi: 'Thấu hiểu Làn da cùng AI Chuẩn hóa',
    descEn:
      'Run the YOLOv8n-v8.2 Skin Scan with pre-inference quality gating, consult the Server RAG Advisor, and learn INCI science.',
    descVi:
      'Quét da YOLOv8n-v8.2 kèm kiểm định chất lượng ảnh, hỏi Trợ lý AI RAG và học khoa học thành phần tại Học viện.',
    ctaLabelEn: 'Start AI Skin Scan',
    ctaLabelVi: 'Bắt đầu Quét da AI',
    actionAttr: 'data-go="scan"'
  },
  {
    id: 'experience',
    code: '03 · EXPERIENCE',
    titleEn: 'Experience Smart Routines & 3D Packaging',
    titleVi: 'Trải nghiệm Quy trình Thông minh & Bao bì 3D',
    descEn:
      'Build budget-aware AM/PM routines from verified Thorakao products, inspect 3D packaging, and shop seamlessly.',
    descVi:
      'Xây dựng quy trình sáng/tối theo ngân sách từ sản phẩm chính hãng, xoay thử bao bì 3D và đặt hàng minh bạch.',
    ctaLabelEn: 'Shop & Inspect Passports',
    ctaLabelVi: 'Mua sắm & Xem Hộ chiếu SP',
    actionAttr: 'data-go="shop"'
  },
  {
    id: 'grow',
    code: '04 · GROW',
    titleEn: 'Grow Your Long-Term Skincare Journey',
    titleVi: 'Đồng hành Hành trình Chăm sóc Dài hạn',
    descEn:
      'Track objective scan history alongside subjective skin comfort notes, join 7/14/30-day routine challenges, and manage product lifecycles.',
    descVi:
      'Theo dõi lịch sử quét da cùng nhật ký cảm nhận thực tế, tham gia thử thách 7/14/30 ngày và quản lý vòng đời sản phẩm.',
    ctaLabelEn: 'Open Skin Journey & Community',
    ctaLabelVi: 'Mở Hành trình Da & Cộng đồng',
    actionAttr: 'data-eco-open="academy"'
  }
];

export const HERBAL_LAB_INGREDIENTS = [
  {
    id: 'curcuma_longa',
    nameEn: 'Vietnamese Turmeric Root',
    nameVi: 'Nghệ Vàng Việt Nam',
    inci: 'Curcuma Longa (Turmeric) Root Extract',
    botanicalFamily: 'Zingiberaceae (Curcuma longa L.)',
    category: 'botanical_active',
    traditionalUseEn:
      'Used across Vietnamese households for generations to comfort post-blemish skin and support an even-looking complexion.',
    traditionalUseVi:
      'Được các gia đình Việt Nam tin dùng qua nhiều thế hệ để làm dịu vùng da sau mụn và hỗ trợ làm sáng đều màu da.',
    cosmeticFunctionEn: 'Skin Conditioning · Antioxidant · Post-Blemish Tone Support',
    cosmeticFunctionVi: 'Dưỡng da · Chống oxy hóa · Hỗ trợ làm mờ vết thâm',
    scientificReference:
      'Vaughn, A. R. et al. (2016). Effects of Turmeric (Curcuma longa) on Skin Health: A Systematic Review of the Clinical Evidence. Phytotherapy Research, 30(8), 1243–1264.',
    verifiedProducts: ['wash', 'cream', 'duo', 'routine'],
    compatibilityEn:
      'Pairs well with hydrating humectants (Glycerin, Cucumber Extract). Avoid layering simultaneously with harsh physical scrubs.',
    compatibilityVi:
      'Kết hợp tốt với chất cấp ẩm dịu nhẹ (Glycerin, Dưa leo). Tránh chà xát mạnh hoặc dùng chung lúc với tẩy tế bào chết vật lý hạt to.',
    usageConsiderationEn:
      'Natural curcuminoids impart a warm golden hue; apply a thin layer of Turmeric Cream 7g in the evening and cleanse thoroughly in the morning.',
    usageConsiderationVi:
      'Sắc vàng tự nhiên của nghệ có thể lưu nhẹ trên da; nên thoa lớp mỏng Kem Nghệ 7g vào buổi tối và rửa sạch vào sáng hôm sau.'
  },
  {
    id: 'cucumis_sativus',
    nameEn: 'Fresh Cucumber Fruit Extract',
    nameVi: 'Chiết xuất Dưa Leo Tươi',
    inci: 'Cucumis Sativus (Cucumber) Fruit Extract',
    botanicalFamily: 'Cucurbitaceae (Cucumis sativus L.)',
    category: 'hydrating_botanical',
    traditionalUseEn:
      'Sliced fresh in tropical Vietnamese summers to cool sun-warmed skin and replenish surface moisture after cleansing.',
    traditionalUseVi:
      'Thái lát đắp mát da trong mùa hè nhiệt đới Việt Nam, giúp làm dịu và cấp nước tức thì sau bước rửa mặt.',
    cosmeticFunctionEn: 'Humectant · Refreshing Toner · Post-Cleanse Hydration',
    cosmeticFunctionVi: 'Cấp ẩm bề mặt · Làm dịu mát da · Cân bằng sau rửa mặt',
    scientificReference:
      'Nema, N. K. et al. (2011). Cucumis sativus fruit-potential antioxidant, anti-hyaluronidase, and anti-elastase agent. Archives of Dermatological Research, 303(4), 247–252.',
    verifiedProducts: ['toner', 'routine'],
    compatibilityEn:
      'Compatible with all daily cleansers and night creams; prepares skin before applying Turmeric or Ginseng creams.',
    compatibilityVi:
      'Tương thích với mọi sữa rửa mặt và kem dưỡng; dùng ngay sau bước làm sạch để chuẩn bị bề mặt da ẩm mịn.',
    usageConsiderationEn:
      'Pat gently with clean hands or a soft cotton pad; do not rub vigorously around the eye contour.',
    usageConsiderationVi:
      'Vỗ nhẹ bằng tay sạch hoặc bông tẩy trang mềm; tránh chà xát mạnh vùng quanh mắt.'
  },
  {
    id: 'citrus_grandis',
    nameEn: 'Pomelo Peel & Blossom Essential Oil',
    nameVi: 'Tinh dầu Vỏ & Hoa Bưởi',
    inci: 'Citrus Grandis (Grapefruit/Pomelo) Peel Oil',
    botanicalFamily: 'Rutaceae (Citrus maxima / Citrus grandis)',
    category: 'scalp_botanical',
    traditionalUseEn:
      'Simmered in traditional Vietnamese herbal hair rinses to refresh the scalp and leave hair fragrant and resilient.',
    traditionalUseVi:
      'Nấu nước gội đầu truyền thống của phụ nữ Việt giúp làm sạch da đầu, lưu hương thanh mát và giảm gãy rụng do khô xơ.',
    cosmeticFunctionEn: 'Scalp Refreshing · Hair Conditioning · Aromatic Botanical Oil',
    cosmeticFunctionVi: 'Làm sạch da đầu · Dưỡng tóc mềm mượt · Tinh dầu thảo mộc tự nhiên',
    scientificReference:
      'Viuda-Martos, M. et al. (2008). Antifungal activity of lemon, mandarin, grapefruit and orange essential oils. Food Control, 19(12), 1130–1138.',
    verifiedProducts: ['pomelo'],
    compatibilityEn:
      'Formulated in Thorakao Pomelo Shampoo; can be alternated with Roasted Soapberry (Bồ Kết) Shampoo.',
    compatibilityVi:
      'Có trong Dầu gội Hoa Bưởi Thorakao; có thể dùng luân phiên với Dầu gội Bồ Kết.',
    usageConsiderationEn:
      'Individuals with known sensitivity to citrus essential oils (Limonene) should patch test before use.',
    usageConsiderationVi:
      'Người có cơ địa nhạy cảm với tinh dầu họ cam quýt nên thử trước trên vùng da nhỏ.'
  },
  {
    id: 'panax_ginseng',
    nameEn: 'Panax Ginseng Root Extract',
    nameVi: 'Chiết xuất Nhân Sâm',
    inci: 'Panax Ginseng Root Extract',
    botanicalFamily: 'Araliaceae (Panax ginseng C.A. Mey.)',
    category: 'botanical_active',
    traditionalUseEn:
      'Prized in East Asian and Vietnamese herbal traditions to revitalize tired, dull-looking skin.',
    traditionalUseVi:
      'Thảo dược quý trong truyền thống Á Đông và Việt Nam giúp nuôi dưỡng làn da kém sắc, thiếu sức sống.',
    cosmeticFunctionEn: 'Skin Conditioning · Emollient Support · Radiance Care',
    cosmeticFunctionVi: 'Nuôi dưỡng bề mặt da · Dưỡng ẩm mềm mịn · Hỗ trợ làn da tươi tắn',
    scientificReference:
      'Hwang, E. et al. (2017). Efficacy and Safety of Enzyme-Modified Panax ginseng Extract on Skin Hydration and Wrinkle Care. Journal of Ginseng Research, 41(4), 510–517.',
    verifiedProducts: ['ginseng'],
    compatibilityEn:
      'Pairs well with gentle hydrating toners and essential-oil-free evening routines.',
    compatibilityVi:
      'Phù hợp kết hợp cùng nước hoa hồng cấp ẩm và quy trình dưỡng tối không chứa tinh dầu nồng.',
    usageConsiderationEn:
      'Apply a thin layer to clean skin; suitable for users seeking a turmeric-free evening cream.',
    usageConsiderationVi:
      'Thoa lớp mỏng lên da sạch; lựa chọn thay thế lý tưởng khi không muốn dùng sắc vàng của nghệ.'
  },
  {
    id: 'gleditsia_australis',
    nameEn: 'Roasted Vietnamese Soapberry (Bồ Kết)',
    nameVi: 'Trái Bồ Kết Nướng Truyền Thống',
    inci: 'Gleditsia Australis Fruit Extract',
    botanicalFamily: 'Fabaceae (Gleditsia australis Hemsl.)',
    category: 'scalp_botanical',
    traditionalUseEn:
      'Roasted over charcoal before steeping in warm water to release natural saponins that cleanse hair with a dark, glossy finish.',
    traditionalUseVi:
      'Nướng thơm trên than hồng rồi nấu nước gội đầu, giải phóng saponin tự nhiên giúp mái tóc đen óng ả và sạch gàu.',
    cosmeticFunctionEn: 'Natural Botanical Surfactant · Hair Gloss & Scalp Cleansing',
    cosmeticFunctionVi: 'Làm sạch dịu nhẹ từ saponin tự nhiên · Dưỡng tóc bóng mượt',
    scientificReference:
      'Le, T. H. et al. (2020). Triterpenoid Saponins from Gleditsia australis Fruits and Their Surface-Active Properties. Natural Product Communications, 15(5), 1–7.',
    verifiedProducts: ['boket'],
    compatibilityEn:
      'Gentle daily scalp cleanser; safe for alternating with Pomelo Blossom shampoo.',
    compatibilityVi:
      'Làm sạch da đầu hàng ngày dịu nhẹ; kết hợp tốt khi gội luân phiên hàng tuần.',
    usageConsiderationEn:
      'Avoid direct contact with eyes as natural soapberry saponins can cause temporary stinging.',
    usageConsiderationVi:
      'Tránh để bọt sản phẩm dính trực tiếp vào mắt vì saponin bồ kết tự nhiên gây cay mắt.'
  },
  {
    id: 'zingiber_officinale',
    nameEn: 'Vietnamese Fresh Ginger Root',
    nameVi: 'Gừng Tươi Việt Nam',
    inci: 'Zingiber Officinale (Ginger) Root Extract',
    botanicalFamily: 'Zingiberaceae (Zingiber officinale Roscoe)',
    category: 'botanical_active',
    traditionalUseEn:
      'Used in warming herbal baths and scalp washes during humid monsoon seasons to invigorate and purify.',
    traditionalUseVi:
      'Dùng trong nước tắm và gội thảo mộc ngày mưa lạnh giúp làm ấm, làm sạch mồ hôi và mang lại cảm giác sảng khoái.',
    cosmeticFunctionEn: 'Aromatic Warming Extract · Purifying Body & Scalp Care',
    cosmeticFunctionVi: 'Chiết xuất làm ấm thảo mộc · Làm sạch và khử mùi cơ thể',
    scientificReference:
      'Mao, Q. Q. et al. (2019). Bioactive Compounds and Bioactivities of Ginger (Zingiber officinale Roscoe). Foods, 8(6), 185.',
    verifiedProducts: ['ginger'],
    compatibilityEn:
      'Ideal for post-workout or monsoon-season cleansing routines.',
    compatibilityVi:
      'Thích hợp dùng làm sạch sau khi vận động ngoài trời hoặc trong thời tiết ẩm lạnh.',
    usageConsiderationEn:
      'Rinse thoroughly with lukewarm water; not intended for broken or freshly shaved skin.',
    usageConsiderationVi:
      'Xả sạch với nước ấm vừa phải; không thoa lên vùng da đang trầy xước.'
  },
  {
    id: 'cera_alba_emollients',
    nameEn: 'Beeswax, Olive & Coconut-Derived Emollients',
    nameVi: 'Sáp Ong, Dầu Ô-liu & Hệ Nền Dưỡng Ẩm Tự Nhiên',
    inci: 'Cera Alba (Beeswax) · Olea Europaea (Olive) Fruit Oil · Glycerin',
    botanicalFamily: 'Natural Wax & Botanical Lipid Matrix',
    category: 'barrier_base',
    traditionalUseEn:
      'Forms a protective breathable balm matrix in classic Vietnamese cold-weather and air-conditioned skin care.',
    traditionalUseVi:
      'Tạo màng khóa ẩm bảo vệ da và môi trong thời tiết hanh khô hoặc môi trường máy lạnh.',
    cosmeticFunctionEn: 'Occlusive Barrier Support · Emollient Softening · Moisture Lock',
    cosmeticFunctionVi: 'Khóa ẩm bề mặt · Làm mềm vùng da khô · Bảo vệ hàng rào ẩm',
    scientificReference:
      'Kurek-Górecka, A. et al. (2020). Bee Products in Dermatology and Skin Care. Molecules, 25(3), 556.',
    verifiedProducts: ['cream', 'lip', 'ginseng'],
    compatibilityEn:
      'Apply as the final step in an evening routine to seal in water-based toner hydration.',
    compatibilityVi:
      'Sử dụng ở bước cuối cùng của quy trình để khóa lại độ ẩm từ nước hoa hồng.',
    usageConsiderationEn:
      'On very oily T-zones, use a pea-sized amount or apply selectively to dry/post-blemish spots.',
    usageConsiderationVi:
      'Với vùng chữ T quá dầu, chỉ nên chấm lượng nhỏ vừa đủ lên vùng da khô hoặc vết thâm.'
  }
];

export const DIGITAL_PASSPORT_REGISTRY = {
  manufacturer: 'Lan Hảo Cosmetics Co., Ltd. (Công ty TNHH Sản xuất Mỹ phẩm Lan Hảo)',
  headquarters: '241bis Cách Mạng Tháng Tám, Ward 4, District 3, Ho Chi Minh City, Vietnam',
  establishedYear: 1961,
  qualityStandardNoteEn:
    'Manufactured under CGMP-ASEAN Cosmetic Guidelines registered with the Ho Chi Minh City Department of Health.',
  qualityStandardNoteVi:
    'Sản xuất theo tiêu chuẩn Thực hành tốt sản xuất mỹ phẩm CGMP-ASEAN công bố tại Sở Y tế TP.HCM.',
  batchLookupStatusEn:
    'Live factory lot/batch telemetry requires enterprise ERP integration (currently unavailable in public web preview). Check the stamped manufacturing (NSX) and expiry (HSD) dates printed on your physical box.',
  batchLookupStatusVi:
    'Tra cứu số lô sản xuất thời gian thực cần tích hợp hệ thống ERP nhà máy (chưa khả dụng trên bản xem trước). Vui lòng đối chiếu NSX và HSD in trực tiếp trên vỏ hộp thực tế.',
  storageInstructionEn:
    'Store in a cool, dry place below 30°C away from direct sunlight. Close cap tightly after each use.',
  storageInstructionVi:
    'Bảo quản nơi khô ráo, thoáng mát dưới 30°C, tránh ánh nắng trực tiếp. Đậy kín nắp sau khi dùng.'
};

export const KNOWLEDGE_ACADEMY_MODULES = [
  {
    id: 'inci_101',
    code: 'MODULE 01 · FORMULATION LITERACY',
    titleEn: 'How to Read an INCI Ingredient List',
    titleVi: 'Cách đọc Bảng Thành phần Mỹ phẩm Chuẩn Quốc tế (INCI)',
    duration: '4 min read',
    summaryEn:
      'Ingredients are listed in descending order of concentration down to 1%. Learn how aqua, humectants (Glycerin), botanical extracts (Curcuma Longa), and preservatives work together.',
    summaryVi:
      'Thành phần được xếp theo thứ tự nồng độ giảm dần đến ngưỡng 1%. Hiểu rõ vai trò của dung môi (Aqua), chất cấp ẩm (Glycerin), chiết xuất thảo mộc và hệ bảo quản an toàn.',
    keyTakeawayEn:
      'High-potency botanical extracts like Curcuma Longa Root Extract and Panax Ginseng Root Extract remain active at low cosmetic percentages without needing to be the first ingredient.',
    keyTakeawayVi:
      'Các chiết xuất thảo mộc hoạt tính cao như Nghệ và Nhân Sâm phát huy tác dụng ở nồng độ mỹ phẩm tiêu chuẩn mà không cần đứng đầu bảng thành phần.'
  },
  {
    id: 'vietnamese_herbs',
    code: 'MODULE 02 · BOTANICAL PHYTOCHEMISTRY',
    titleEn: 'Traditional Vietnamese Herbs vs. Modern Cosmetic Science',
    titleVi: 'Thảo mộc Truyền thống Việt Nam dưới góc nhìn Khoa học Mỹ phẩm',
    duration: '5 min read',
    summaryEn:
      'Why raw crushed turmeric or unboiled soapberry differs from standardized cosmetic extracts: filtration of insoluble resins, pH balancing, and microbiological safety.',
    summaryVi:
      'Sự khác biệt giữa nghệ tươi giã tay và dịch chiết mỹ phẩm chuẩn hóa: lọc bỏ nhựa gây kích ứng, cân bằng độ pH sinh lý và kiểm soát vi sinh.',
    keyTakeawayEn:
      'Standardized cosmetic extraction preserves curcuminoids and saponins while maintaining stable pH and shelf-life safety.',
    keyTakeawayVi:
      'Chiết xuất chuẩn hóa giúp giữ lại hoạt chất quý đồng thời đảm bảo độ ổn định pH và an toàn vi sinh trên da.'
  },
  {
    id: 'tropical_barrier',
    code: 'MODULE 03 · TROPICAL SKIN PHYSIOLOGY',
    titleEn: 'Caring for Skin in Hot, Humid Monsoon Climates',
    titleVi: 'Bảo vệ Hàng rào Độ ẩm Da trong Khí hậu Nhiệt đới Gió mùa',
    duration: '4 min read',
    summaryEn:
      'High humidity increases sebum oxidation while indoor air-conditioning dehydrates the stratum corneum. A 2-to-3 step routine prevents both congestion and barrier stripping.',
    summaryVi:
      'Độ ẩm cao làm tăng tiết bã nhờn nhưng máy lạnh trong nhà lại gây mất nước biểu bì. Quy trình tinh gọn 2–3 bước giúp làm sạch thoáng mà không bào mòn màng ẩm.',
    keyTakeawayEn:
      'Always pair gentle cleansing with lightweight alcohol-free hydration (Cucumber Toner) before targeted night care.',
    keyTakeawayVi:
      'Luôn kết hợp làm sạch dịu nhẹ với bước cấp ẩm không cồn (Nước Hoa Hồng Dưa Leo) trước khi chấm kem dưỡng tối.'
  }
];

export const ACADEMY_QUIZ_QUESTIONS = [
  {
    id: 'q1',
    questionEn: 'In an official INCI ingredient list, how are ingredients ordered above 1% concentration?',
    questionVi: 'Trong bảng thành phần chuẩn INCI, các chất có nồng độ trên 1% được sắp xếp như thế nào?',
    optionsEn: [
      'Alphabetically from A to Z',
      'In descending order from highest to lowest concentration',
      'By botanical origin first, then synthetic ingredients'
    ],
    optionsVi: [
      'Theo thứ tự bảng chữ cái A đến Z',
      'Theo thứ tự nồng độ giảm dần từ cao xuống thấp',
      'Xếp thảo mộc tự nhiên trước, hoạt chất tổng hợp sau'
    ],
    correctIndex: 1,
    explanationEn:
      'Under international INCI labeling standards, ingredients present above 1% are listed in descending order by weight.',
    explanationVi:
      'Theo quy chuẩn ghi nhãn INCI quốc tế, các thành phần trên 1% được liệt kê theo thứ tự khối lượng giảm dần.'
  },
  {
    id: 'q2',
    questionEn: 'What does the YOLOv8n AI Skin Scan provide?',
    questionVi: 'Công cụ Quét da AI YOLOv8n cung cấp thông tin gì?',
    optionsEn: [
      'A clinical medical diagnosis replacing a dermatologist',
      'Non-medical cosmetic surface observation to help personalize daily skincare routines',
      'Prescription medication dosages'
    ],
    optionsVi: [
      'Chẩn đoán bệnh lý y khoa thay thế bác sĩ da liễu',
      'Quan sát bề mặt thẩm mỹ phi y tế giúp gợi ý quy trình chăm sóc da hàng ngày',
      'Kê đơn thuốc điều trị da liễu'
    ],
    correctIndex: 1,
    explanationEn:
      'AI Skin Scan is strictly a non-medical cosmetic guidance tool and never diagnoses dermatological diseases.',
    explanationVi:
      'Quét da AI hoàn toàn là công cụ gợi ý chăm sóc thẩm mỹ phi y tế, tuyệt đối không chẩn đoán bệnh da liễu.'
  },
  {
    id: 'q3',
    questionEn: 'Why is standardized Curcuma Longa extract preferred over raw kitchen turmeric on facial skin?',
    questionVi: 'Vì sao dịch chiết Nghệ chuẩn hóa trong mỹ phẩm an toàn hơn nghệ tươi tự giã đắp trực tiếp?',
    optionsEn: [
      'Standardized extracts filter impurities, balance pH, and undergo microbiological safety checks',
      'Raw turmeric contains zero curcuminoids',
      'Cosmetic extracts permanently change skin genetics'
    ],
    optionsVi: [
      'Dịch chiết chuẩn hóa đã lọc tạp chất nhựa, cân bằng pH và kiểm nghiệm an toàn vi sinh',
      'Nghệ tươi không có hoạt chất curcumin',
      'Dịch chiết mỹ phẩm làm thay đổi cấu trúc gen của da'
    ],
    correctIndex: 0,
    explanationEn:
      'Cosmetic formulation removes irritating raw resins and ensures consistent pH and microbial safety.',
    explanationVi:
      'Bào chế mỹ phẩm giúp loại bỏ nhựa gây kích ứng, ổn định độ pH và đảm bảo tiêu chuẩn vi sinh.'
  }
];

export const COMMUNITY_CHALLENGES = [
  {
    id: 'chal_7d',
    days: 7,
    titleEn: '7-Day Gentle Cleansing Reset',
    titleVi: 'Thử thách 7 Ngày Làm sạch Dịu nhẹ',
    targetEn: 'Morning & evening gentle wash without harsh scrubbing + post-cleanse hydration.',
    targetVi: 'Rửa mặt dịu nhẹ sáng & tối không chà xát mạnh kết hợp vỗ nước hoa hồng cấp ẩm.',
    rewardPoints: 50,
    recommendedSku: 'wash'
  },
  {
    id: 'chal_14d',
    days: 14,
    titleEn: '14-Day Evening Turmeric Spot Care',
    titleVi: 'Thử thách 14 Ngày Chấm Nghệ Dưỡng Tối',
    targetEn: 'Consistent thin-layer evening application of Turmeric Cream 7g on post-blemish areas.',
    targetVi: 'Duy trì thoa lớp mỏng Kem Nghệ 7g mỗi tối lên vùng da sau mụn.',
    rewardPoints: 120,
    recommendedSku: 'duo'
  },
  {
    id: 'chal_30d',
    days: 30,
    titleEn: '30-Day Minimalist Barrier Consistency',
    titleVi: 'Thử thách 30 Ngày Kiên trì Quy trình Tinh gọn',
    targetEn: 'Complete 3-step Cleanse · Tone · Night Cream routine with weekly subjective comfort logs.',
    targetVi: 'Hoàn thành quy trình 3 bước Rửa mặt · Cân bằng · Dưỡng tối kèm ghi chú cảm nhận hàng tuần.',
    rewardPoints: 300,
    recommendedSku: 'routine'
  }
];

export const RND_INNOVATION_HYPOTHESES = [
  {
    id: 'hyp_01',
    code: 'R&D-HYP-2026-01',
    title: 'Lightweight Gel-Emulsion Carrier for Curcuma Longa in Humid Monsoon Climates',
    targetSegment: 'Gen-Z & University Students (Oily / Combination T-Zone)',
    aggregatedSignal: '64% of combination-skin quiz profiles request non-heavy daytime hydration.',
    literatureBasis:
      'Vaughn et al. (2016) Phytotherapy Research; topical curcuminoid nano-emulsion stability literature.',
    validationGateStatus: 'Requires Cosmetic Chemist Formulation Trial, 90-Day Accelerated Stability & Patch Testing'
  },
  {
    id: 'hyp_02',
    code: 'R&D-HYP-2026-02',
    title: 'Refillable Pouch Architecture for Pomelo Blossom & Roasted Soapberry Shampoos',
    targetSegment: 'Repeat Household Buyers (30–60 Day Depletion Cycle)',
    aggregatedSignal: 'High repeat-purchase intent on hair-care SKUs; lowers single-use HDPE bottle weight by ~68%.',
    literatureBasis:
      'ASEAN Cosmetic Packaging Sustainability Guidelines & preservative challenge validation for refill pouches.',
    validationGateStatus: 'Requires Packaging Seal Integrity, Microbial Challenge (ISO 11930) & Supply-Chain Audit'
  }
];
