/**
 * Content, Articles, Reviews, Locations, and Quiz Data Configuration
 */

export const REVIEWS_DATA = [
  ['M', 'M., 20', 'Blemish-prone skin', 'An easy routine at a student-friendly price.'],
  ['H', 'H., 47', 'Buying for my mother', 'The same brand my mother used. I trust it.'],
  ['T', 'T., 23', 'Oily skin', 'The face wash feels fresh and not too harsh.'],
  ['L', 'L., 52', 'Dull-looking skin', 'The cream is easy to add to my evening routine.'],
  ['D', 'D., 25', 'Dark marks', 'Simple steps I can follow after work.'],
  ['A', 'A., 19', 'Student', 'Easy to buy and kind to my budget.']
];

export const GALLERY_DATA = [
  ['botanical', 'Lotus line art'],
  ['turmeric', 'Fresh turmeric slices'],
  ['p-jar', 'Turmeric Cream 30g'],
  ['p-toner', 'Cucumber Toner 100ml'],
  ['p-lip', 'Lip Balm 10g'],
  ['p-bottle', 'Turmeric Face Wash 120g']
];

export const INGREDIENTS_DATA = [
  ['Turmeric', 'turmeric', 'A familiar kitchen root, used in the face wash and the night cream.', 'blemish'],
  ['Cucumber', 'p-toner', 'Cucumber gives the toner its fresh, light feel (per label).', 'dry'],
  ['Gentle lip care', 'p-lip', 'A small balm for everyday comfort, in the bag or by the bed.', 'lips']
];

export const TIPS_ARTICLES = [
  [
    1,
    'Routine basics',
    'p-jar',
    'Your first routine in two steps',
    '3 min read',
    'Start small. Cleanse with the face wash, then use one night cream. Give your skin a couple of weeks before adding anything new, and always check the label before trying a product.',
    'wash'
  ],
  [
    2,
    'Ingredients',
    'turmeric',
    'Turmeric in the Vietnamese kitchen and bathroom',
    '4 min read',
    'Turmeric is a familiar kitchen root in Vietnam, and Thorakao uses it in its face wash and night cream. The wording on the box is the best guide to what each product is made for.',
    'cream'
  ],
  [
    3,
    'Routine basics',
    'p-toner',
    'Read the label like a pro',
    '3 min read',
    'Look at the ingredient list, the usage steps and the warnings before you buy. If your skin feels irritated, stop using the product and ask a pharmacist or dermatologist.',
    'toner'
  ],
  [
    4,
    'Gifts',
    'set-duo',
    'Gifts for mum and grandma',
    '2 min read',
    'A familiar brand is a thoughtful gift. The Turmeric Set and the Lip Balm are easy picks for someone who likes a simple routine.',
    'duo'
  ],
  [
    5,
    'Lip care',
    'p-lip',
    'Comfort for dry lips',
    '2 min read',
    'Air conditioning and hot weather can leave lips dry. Keep a small balm in your bag and apply it whenever your lips feel dry.',
    'lip'
  ],
  [
    6,
    'Routine basics',
    'botanical',
    'A calm evening routine',
    '3 min read',
    'Wash your face, apply your night cream as directed and keep the steps in the same order every night. A simple habit is easier to keep than a long list of products.',
    'routine'
  ]
];

export const STORE_LOCATIONS = [
  {
    id: 'hq',
    city: 'hcm',
    n: 'Thorakao Head Office',
    addr: '241bis Cach Mang Thang Tam Street, Ban Co Ward, Ho Chi Minh City (District 3 area)',
    phone: '028 8887 3241',
    q: 'Thorakao 241bis Cach Mang Thang Tam District 3 Ho Chi Minh City',
    note: 'Registered head office of Lan Hao Cosmetics. Phone support 8:00 to 20:00.'
  },
  {
    id: 'ws',
    city: 'hcm',
    n: 'Production workshop (registered branch)',
    addr: '1191 National Highway 1A, Thoi An Ward, Ho Chi Minh City (District 12 area)',
    q: '1191 Quoc lo 1A Thoi An District 12 Ho Chi Minh City',
    note: 'Listed in the business registry as a workshop. Not a retail store.'
  },
  {
    id: 's-hcm',
    city: 'hcm',
    n: 'Thorakao stockists in Ho Chi Minh City',
    q: 'Thorakao cosmetics Ho Chi Minh City',
    note: 'Google Maps listings for shops and pharmacies that sell Thorakao.'
  },
  {
    id: 's-hn',
    city: 'hn',
    n: 'Thorakao stockists in Hanoi',
    q: 'Thorakao cosmetics Hanoi',
    note: 'Google Maps listings for shops and pharmacies that sell Thorakao.'
  },
  {
    id: 's-dn',
    city: 'dn',
    n: 'Thorakao stockists in Da Nang',
    q: 'Thorakao cosmetics Da Nang',
    note: 'Google Maps listings for shops and pharmacies that sell Thorakao.'
  },
  {
    id: 's-ct',
    city: 'ct',
    n: 'Thorakao stockists in Can Tho',
    q: 'Thorakao cosmetics Can Tho',
    note: 'Google Maps listings for shops and pharmacies that sell Thorakao.'
  }
];

export const QUIZ_QUESTIONS = [
  [
    'feel',
    'How does your skin feel by midday?',
    [
      ['oily', 'Oily or shiny'],
      ['balanced', 'Balanced'],
      ['tight', 'Tight or dry']
    ]
  ],
  [
    'concern',
    'What bothers you most?',
    [
      ['breakouts', 'Blemishes'],
      ['marks', 'Dark marks'],
      ['dull', 'Dull or tired look'],
      ['dryness', 'Dryness']
    ]
  ],
  [
    'who',
    'Who is it for?',
    [
      ['me', 'Me'],
      ['mum', 'My mum or grandma']
    ]
  ],
  [
    'time',
    'How long is your routine?',
    [
      ['quick', '2 quick steps'],
      ['full', 'Up to 3 steps']
    ]
  ]
];

export const FEEL_MAP = {
  oily: 'Oily skin',
  balanced: 'Balanced skin',
  tight: 'Dry or tight skin'
};

export const CONCERN_MAP = {
  breakouts: 'Blemish-prone',
  marks: 'Dark marks',
  dull: 'Dull or tired look',
  dryness: 'Lacking moisture'
};

export const FINDINGS_MAP = {
  feel: {
    oily: 'Shine builds up through the day, mostly around the T-zone.',
    balanced: 'Your skin feels comfortable through the day.',
    tight: 'Your skin feels tight or dry by midday.'
  },
  con: {
    breakouts: 'Blemishes tend to appear when oil, sweat and dust build up.',
    marks: 'Dark marks stay visible after blemishes heal.',
    dull: 'Your skin looks tired or uneven in tone.',
    dryness: 'Your skin loses moisture quickly, especially in air conditioning.'
  }
};

export const GOALS_MAP = {
  breakouts: [
    'Keep skin clean without over-drying it.',
    'Refresh skin after hot, humid days.',
    'Keep a steady night routine for blemish-prone areas.'
  ],
  marks: [
    'Support an even-looking skin tone with a steady night routine.',
    'Avoid picking at blemishes.',
    'Protect your skin from the sun every morning.'
  ],
  dull: [
    'Refresh skin with gentle cleansing and toner.',
    'Keep skin hydrated through the day.',
    'Keep regular sleep and water habits.'
  ],
  dryness: [
    'Cleanse gently, once or twice a day.',
    'Rehydrate right after cleansing with toner.',
    'Protect lips and dry areas through the day.'
  ]
};

export const ROUTINE_INSTRUCTIONS = {
  wash: {
    am: 'Wet your face, add a little face wash, massage gently and rinse.',
    pm: 'Massage the face wash over wet skin, spend a little longer on blackhead-prone areas, then rinse.'
  },
  toner: {
    am: 'Press toner onto your skin with a cotton pad to refresh before the day.',
    pm: 'Press toner onto your skin with a cotton pad after cleansing.'
  },
  cream: {
    pm: 'Dry your face, then smooth a thin layer of Turmeric Cream evenly, or dab it on spots. Follow the leaflet in the box.'
  },
  lip: {
    am: 'Apply to your lips whenever they feel dry.',
    pm: 'Apply a little before bed.'
  }
};

export const PRODUCT_INGREDIENTS = {
  wash: 'Turmeric (per label). See the full ingredient list on the box.',
  cream: 'Turmeric (per label). See the full ingredient list on the box.',
  toner: 'Cucumber, alcohol-free (per label). See the full list on the bottle.',
  lip: 'See the full ingredient list on the pack.',
  duo: 'Turmeric Face Wash and Turmeric Cream. See the full list on each box.',
  routine: 'Turmeric Face Wash, Cucumber Toner and Turmeric Cream. See the full list on each pack.',
  pomelo: 'Pomelo blossom & peel essential oil (Citrus Grandis), pro-vitamin B5 (per label). See the full list on the bottle.',
  ginseng: 'Panax ginseng root extract, pearl powder, vitamin E (per label). See the full list on the box.',
  boket: 'Concentrated roasted soapberry fruit extract (Gleditsia Australis) rich in natural saponin (per label).',
  ginger: 'Fresh ginger rhizome essential oil (Zingiber Officinale) and brown seaweed extract (per label).'
};

export const PRODUCT_HOW_TO_USE = {
  wash: ROUTINE_INSTRUCTIONS.wash.pm,
  toner: ROUTINE_INSTRUCTIONS.toner.pm,
  cream: ROUTINE_INSTRUCTIONS.cream.pm,
  lip: ROUTINE_INSTRUCTIONS.lip.am,
  duo: 'Cleanse with the face wash, then care for blemish-prone skin at night with the cream.',
  routine: 'Cleanse, refresh with toner, then use the cream at night.',
  pomelo: 'Massage onto wet scalp and hair for 60 seconds, then rinse thoroughly with cool water.',
  ginseng: 'Apply a thin layer over clean facial skin in the evening for up to 2 hours.',
  boket: 'Lather a small amount onto wet hair and scalp, massage gently and rinse clean.',
  ginger: 'Massage in circular motions onto targeted body areas for 10 to 15 minutes after bathing.'
};

