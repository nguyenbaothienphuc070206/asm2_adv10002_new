/**
 * Product Catalog, Featured Day Rows, and Routine Steps Configuration
 * Preserves 100% of core SKU contracts while adding verified authentic
 * Thorakao botanical flagship products (Pomelo, Ginseng, Soapberry, Ginger).
 */
export const C = {
  wash: {
    id: 'wash',
    n: 'Turmeric Face Wash 120g',
    p: 45000,
    r: 4.6,
    c: 112,
    b: 'Rinses away dust and oil. Made with turmeric for blemish-prone skin (per label).',
    bf: 'oily, blemish-prone skin',
    t: 'blemish oily',
    k: 'p-bottle',
    botanicalKey: 'turmeric',
    officialSku: 'Sữa rửa mặt Hạt Nghệ ngừa mụn 100g'
  },
  cream: {
    id: 'cream',
    n: 'Turmeric Cream 30g',
    p: 59000,
    r: 4.7,
    c: 240,
    b: 'A night cream for dark marks and blemishes (per label).',
    bf: 'dark marks and blemishes',
    t: 'blemish marks dull',
    k: 'p-jar',
    botanicalKey: 'turmeric',
    officialSku: 'Kem Nghệ Thorakao 7g'
  },
  toner: {
    id: 'toner',
    n: 'Cucumber Toner 100ml',
    p: 55000,
    r: 4.5,
    c: 96,
    b: 'An alcohol-free toner that refreshes skin after cleansing (per label).',
    bf: 'oily or dry skin, after cleansing',
    t: 'oily dry dull',
    k: 'p-toner',
    botanicalKey: 'rose_cucumber',
    officialSku: 'Nước hoa hồng cân bằng da Thorakao 150ml'
  },
  lip: {
    id: 'lip',
    n: 'Lip Balm 10g',
    p: 29000,
    r: 4.6,
    c: 74,
    b: 'A small balm for soft, comfortable lips.',
    bf: 'dry lips, air-conditioned days',
    t: 'dry lips',
    k: 'p-lip',
    botanicalKey: 'rice_beeswax',
    officialSku: 'Academic Concept SKU (See Missing-Image Report)'
  },
  duo: {
    id: 'duo',
    n: 'Turmeric Set: Face Wash + Cream',
    p: 89000,
    o: 104000,
    r: 4.8,
    c: 188,
    b: 'Cleanse, then care for blemish-prone skin at night.',
    bf: 'starting a simple routine',
    t: 'blemish oily marks',
    k: 'set-duo',
    botanicalKey: 'turmeric',
    officialSku: 'Kem Nghệ Đa Sinh Tố Leyna 25g / Bộ Đôi Nghệ'
  },
  routine: {
    id: 'routine',
    n: 'Full Routine Set: Wash + Toner + Cream',
    p: 139000,
    o: 159000,
    r: 4.8,
    c: 121,
    b: 'Cleanse, refresh and care in three simple steps.',
    bf: 'a complete daily routine',
    t: 'blemish oily marks dull dry',
    k: 'set-routine',
    botanicalKey: 'turmeric',
    officialSku: 'Combo 4 bước dưỡng da sáng đều màu thâm mụn'
  },
  pomelo: {
    id: 'pomelo',
    n: 'Grapefruit Blossom Shampoo 500ml',
    p: 73000,
    r: 4.8,
    c: 195,
    b: 'Distilled from Vietnamese pomelo blossoms and peel oil for strong, refreshed hair.',
    bf: 'fragile hair and scalp vitality',
    t: 'dry dull',
    k: 'p-pomelo',
    botanicalKey: 'grapefruit',
    officialSku: 'Dầu gội Hoa Bưởi sạch tóc giảm rụng 500ml'
  },
  ginseng: {
    id: 'ginseng',
    n: 'Ginseng Radiant Cream 7g',
    p: 55000,
    r: 4.7,
    c: 164,
    b: 'Infused with Panax ginseng root extract and pearl powder for luminous, supple skin.',
    bf: 'dull or tired-looking skin',
    t: 'dull dry',
    k: 'p-ginseng',
    botanicalKey: 'ginseng',
    officialSku: 'Kem sâm dưỡng da sáng mịn Thorakao 7g'
  },
  boket: {
    id: 'boket',
    n: 'Soapberry Herbal Shampoo 250ml',
    p: 48000,
    r: 4.8,
    c: 210,
    b: 'Traditional roasted Vietnamese soapberry (Cao Bồ Kết) rich in natural saponins.',
    bf: 'oily scalp and natural shine',
    t: 'oily dull',
    k: 'p-boket',
    botanicalKey: 'soapberry',
    officialSku: 'Dầu gội Cao Bồ Kết Thorakao 250ml'
  },
  ginger: {
    id: 'ginger',
    n: 'Fresh Ginger Massage Cream 200g',
    p: 135000,
    r: 4.7,
    c: 88,
    b: 'Warming Vietnamese ginger rhizome and brown seaweed extract for smooth body contours.',
    bf: 'warming body care and massage',
    t: 'dry',
    k: 'p-ginger',
    botanicalKey: 'ginger',
    officialSku: 'Kem Massage Gừng Thorakao 200g'
  }
};

export const DAYS_DATA = [
  [
    'Turmeric',
    'wash',
    'Rinses away dust and oil. A kitchen favourite, made for blemish-prone skin (per label).',
    'blemish',
    'p-bottle',
    '#ead7ba'
  ],
  [
    'Turmeric, overnight',
    'cream',
    'A small jar for your night routine. Smooth a thin layer on your face or dab it on spots.',
    'marks',
    'p-jar',
    '#f3e8d1'
  ],
  [
    'Cucumber',
    'toner',
    'Fresh and alcohol-free. A calm finish after cleansing (per label).',
    'dry',
    'p-toner',
    '#e5d3b3'
  ]
];

export const ROUTINE_STEPS_DATA = [
  [
    'Cleanse',
    'Put a little face wash in your palm, add water and spread it over your face. Spend a little longer on blackhead-prone areas, then rinse.',
    'p-bottle'
  ],
  [
    'Refresh',
    'After cleansing, press Cucumber Toner onto your skin with a cotton pad.',
    'p-toner'
  ],
  [
    'Treat (night)',
    'Dry your face. Apply a thin layer of Turmeric Cream evenly, or dab it on spots. Follow the leaflet in the box.',
    'p-jar'
  ],
  ['Lip care', 'Apply Lip Balm whenever your lips feel dry.', 'p-lip']
];
