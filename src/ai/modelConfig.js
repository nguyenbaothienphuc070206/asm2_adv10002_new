/**
 * YOLOv8n AI Skin Scan Configuration & Class Definitions (Priority 2)
 * Defines architecture parameters, input tensor geometry, non-medical visible
 * skin feature classes, confidence thresholds, NMS IoU, and calibration constants.
 */

export const YOLOV8N_MODEL_CONFIG = {
  modelId: 'yolov8n-thorakao-skin-v8.2',
  architecture: 'YOLOv8n (CSPDarknet Nano Backbone + PANet Neck + Decoupled Anchor-Free Head)',
  taskType: 'Object Detection & Multi-Zone Facial Feature Localization',
  inputTensorShape: [1, 3, 640, 640],
  inputSize: 640,
  normalization: 'RGB [0, 1] with aspect-preserving 640x640 letterbox padding (pad value 114)',
  parametersCount: '3,011,823 (3.01M)',
  flops: '8.1 GFLOPs',
  modelWeightSizeMb: 6.2,
  nmsIoUThreshold: 0.45,
  maxDetectionsPerZone: 8,
  temperatureScaling: 1.28,
  uncertaintyThreshold: 0.42,
  medicalDisclaimer:
    'Cosmetic visual skin feature analysis only. Not a medical diagnostic device. For persistent acne, dermatitis, or clinical skin conditions, please consult a board-certified dermatologist.'
};

/**
 * 5 Non-Medical Visible Skin Feature Classes (Priority 2 Step 4)
 */
export const SKIN_FEATURE_CLASSES = [
  {
    id: 0,
    key: 'acne_features',
    label: 'Acne-related visible features',
    shortLabel: 'Visible Blemish',
    confThreshold: 0.40,
    color: '#c83e2b',
    description: 'Localized surface papule, comedone, or active blemish-related visual appearances.',
    recommendedIngredients: ['Turmeric Root (Curcuma Longa)', 'Mild Coconut Surfactants'],
    recommendedSkus: ['wash', 'cream', 'duo']
  },
  {
    id: 1,
    key: 'dark_spots',
    label: 'Dark spot appearance',
    shortLabel: 'Dark Spot',
    confThreshold: 0.38,
    color: '#b8741a',
    description: 'Post-blemish hyperpigmentation marks or uneven melanin tone spots.',
    recommendedIngredients: ['Turmeric Curcuminoids', 'Pearl Powder', 'Panax Ginseng'],
    recommendedSkus: ['cream', 'ginseng', 'routine']
  },
  {
    id: 2,
    key: 'redness',
    label: 'Redness appearance',
    shortLabel: 'Redness Zone',
    confThreshold: 0.41,
    color: '#d45b7a',
    description: 'Visible surface flushing or erythema-like redness in sensitive facial zones.',
    recommendedIngredients: ['Rose Flower Water (Rosa Centifolia)', 'Betaine', 'Panthenol B5'],
    recommendedSkus: ['toner', 'routine']
  },
  {
    id: 3,
    key: 'pore_visibility',
    label: 'Pore visibility',
    shortLabel: 'Pore Texture',
    confThreshold: 0.42,
    color: '#1b7a58',
    description: 'Visible follicular openings and T-zone sebum sheen across nose and medial cheeks.',
    recommendedIngredients: ['Turmeric Granules', 'Rose Water Astringent'],
    recommendedSkus: ['wash', 'toner']
  },
  {
    id: 4,
    key: 'uneven_texture',
    label: 'Uneven skin texture',
    shortLabel: 'Uneven Texture',
    confThreshold: 0.40,
    color: '#6e56af',
    description: 'Dry surface flaking, micro-roughness, or uneven light reflection across cheeks and chin.',
    recommendedIngredients: ['Panax Ginseng Root', 'Beeswax & Vitamin E', 'Rose Betaine'],
    recommendedSkus: ['toner', 'ginseng', 'lip']
  }
];

/**
 * 4 Canonical Facial Zones mapped in normalized 640x640 coordinates
 */
export const FACIAL_ZONES = [
  {
    id: 'forehead',
    name: 'Forehead',
    bboxNormalized: [0.26, 0.14, 0.48, 0.18],
    svgCircle: { cx: 100, cy: 52, r: 16 }
  },
  {
    id: 'cheeks',
    name: 'Cheeks',
    bboxNormalized: [0.18, 0.40, 0.64, 0.22],
    svgCircle: { cx: 66, cy: 112, r: 18 },
    svgCircleRight: { cx: 134, cy: 112, r: 18 }
  },
  {
    id: 'nose',
    name: 'Nose',
    bboxNormalized: [0.42, 0.36, 0.16, 0.22],
    svgCircle: { cx: 100, cy: 104, r: 13 }
  },
  {
    id: 'chin',
    name: 'Chin',
    bboxNormalized: [0.34, 0.66, 0.32, 0.16],
    svgCircle: { cx: 100, cy: 158, r: 14 }
  }
];
