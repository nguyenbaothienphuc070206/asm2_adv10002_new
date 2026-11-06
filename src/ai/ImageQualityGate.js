/**
 * Pre-Inference Image Quality Assessment Gate (Priority 2 Step 4)
 * Evaluates raw RGBA pixel buffers for resolution, brightness/exposure,
 * contrast, sharpness (3x3 Laplacian variance), and central skin/face visibility.
 * Rejects poor-quality images with actionable user feedback before YOLOv8n inference.
 */

export class ImageQualityGate {
  constructor(options = {}) {
    this.minDimension = options.minDimension || 140;
    this.minBrightness = options.minBrightness || 48;
    this.maxBrightness = options.maxBrightness || 232;
    this.minContrast = options.minContrast || 14;
    this.minSharpness = options.minSharpness || 22;
    this.minSkinCoverage = options.minSkinCoverage || 0.14;
  }

  /**
   * Evaluates an RGBA image buffer { data: Uint8ClampedArray|Array, width: number, height: number }.
   * @param {{ data: Uint8ClampedArray|number[], width: number, height: number }} imageBuffer
   * @returns {object} Quality assessment report
   */
  evaluateBuffer(imageBuffer) {
    if (!imageBuffer || !imageBuffer.data || !imageBuffer.width || !imageBuffer.height) {
      return {
        passed: false,
        overallScore: 0,
        statusLabel: 'Invalid Image Input',
        issues: ['Face not clearly visible — no readable image buffer provided.'],
        metrics: { sharpness: 0, brightness: 0, contrast: 0, skinCoverage: 0, resolutionOk: false }
      };
    }

    const { data, width, height } = imageBuffer;
    const resolutionOk = width >= this.minDimension && height >= this.minDimension;

    const totalPixels = width * height;
    const gray = new Float32Array(totalPixels);
    let sumLuma = 0;
    let sumSqLuma = 0;

    // Central ROI bounds (20% to 80% X and Y) for face/skin framing check
    const roiX0 = Math.floor(width * 0.2);
    const roiX1 = Math.ceil(width * 0.8);
    const roiY0 = Math.floor(height * 0.15);
    const roiY1 = Math.ceil(height * 0.85);
    let roiPixels = 0;
    let skinLikePixels = 0;

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      const inY = y >= roiY0 && y < roiY1;
      for (let x = 0; x < width; x++) {
        const idx = (rowOffset + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        gray[rowOffset + x] = luma;
        sumLuma += luma;
        sumSqLuma += luma * luma;

        if (inY && x >= roiX0 && x < roiX1) {
          roiPixels++;
          // YCbCr + RGB warm skin chromaticity envelope (Fitzpatrick I–VI inclusive)
          const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
          const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
          const isSkinTone =
            r > 45 &&
            g > 28 &&
            b > 18 &&
            r >= g * 0.92 &&
            cb >= 72 &&
            cb <= 142 &&
            cr >= 126 &&
            cr <= 182;
          if (isSkinTone) {
            skinLikePixels++;
          }
        }
      }
    }

    const meanBrightness = sumLuma / Math.max(1, totalPixels);
    const varianceLuma = Math.max(0, sumSqLuma / Math.max(1, totalPixels) - meanBrightness * meanBrightness);
    const contrast = Math.sqrt(varianceLuma);
    const skinCoverage = roiPixels > 0 ? skinLikePixels / roiPixels : 0;

    // Compute 3x3 discrete Laplacian variance on central region for sharpness / blur detection
    let lapSum = 0;
    let lapSqSum = 0;
    let lapCount = 0;
    const step = width > 320 ? 2 : 1;

    for (let y = Math.max(1, roiY0); y < Math.min(height - 1, roiY1); y += step) {
      const row = y * width;
      for (let x = Math.max(1, roiX0); x < Math.min(width - 1, roiX1); x += step) {
        const c = gray[row + x];
        const lap =
          -4 * c +
          gray[row + x - 1] +
          gray[row + x + 1] +
          gray[row - width + x] +
          gray[row + width + x];
        lapSum += lap;
        lapSqSum += lap * lap;
        lapCount++;
      }
    }

    const lapMean = lapCount > 0 ? lapSum / lapCount : 0;
    const lapVariance = lapCount > 0 ? Math.max(0, lapSqSum / lapCount - lapMean * lapMean) : 0;
    const sharpness = Math.min(100, Math.round(Math.sqrt(lapVariance) * 3.4));

    const issues = [];
    if (!resolutionOk) {
      issues.push('Resolution too low — please use an image at least 160×160 pixels.');
    }
    if (meanBrightness < this.minBrightness) {
      issues.push('Insufficient lighting — face is underexposed. Move toward natural window light or indoor lamp.');
    } else if (meanBrightness > this.maxBrightness) {
      issues.push('Overexposed glare — direct light is washing out skin texture. Step back from direct flash.');
    }
    if (sharpness < this.minSharpness) {
      issues.push('Image too blurry — hold the camera steady and tap to focus on your cheek and forehead.');
    }
    if (contrast < this.minContrast) {
      issues.push('Low tonal contrast — clean your camera lens and avoid hazy backlighting.');
    }
    if (skinCoverage < this.minSkinCoverage) {
      issues.push('Face not clearly visible — center your forehead, cheeks, nose, and chin inside the guide oval.');
    }

    const passed = issues.length === 0;
    const brightnessScore =
      meanBrightness >= 85 && meanBrightness <= 195
        ? 100
        : Math.max(15, Math.round(100 - Math.abs(meanBrightness - 140) * 0.85));
    const framingScore = Math.min(100, Math.round((skinCoverage / 0.45) * 100));
    const overallScore = Math.round(sharpness * 0.4 + brightnessScore * 0.35 + framingScore * 0.25);

    return {
      passed,
      overallScore: passed ? Math.max(72, overallScore) : Math.min(58, overallScore),
      statusLabel: passed ? 'Quality Gate Passed — Ready for YOLOv8n' : 'Quality Gate Rejected — Retake Required',
      issues,
      metrics: {
        sharpness,
        brightness: Math.round(meanBrightness),
        contrast: Math.round(contrast * 10) / 10,
        skinCoverage: Math.round(skinCoverage * 100),
        resolutionOk,
        width,
        height
      }
    };
  }
}

/**
 * Renders a deterministic synthetic facial skin portrait onto a 2D canvas
 * for instant interactive testing of the Quality Gate and YOLOv8n detector.
 * @param {HTMLCanvasElement} canvas
 * @param {'balanced_daylight'|'post_blemish_marks'|'low_light_reject'|'motion_blur_reject'} preset
 */
export function renderSampleSkinCanvas(canvas, preset = 'balanced_daylight') {
  if (!canvas || typeof canvas.getContext !== 'function') return null;
  const ctx = canvas.getContext('2d');
  const w = canvas.width || 320;
  const h = canvas.height || 320;

  ctx.clearRect(0, 0, w, h);

  if (preset === 'low_light_reject') {
    // Underexposed dark scene (< 48 mean brightness)
    ctx.fillStyle = '#121010';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#241c18';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.5, w * 0.32, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    return ctx.getImageData(0, 0, w, h);
  }

  if (preset === 'motion_blur_reject') {
    // Extremely flat/blurry skin-toned field with zero high-frequency Laplacian detail
    ctx.fillStyle = '#d8aa88';
    ctx.fillRect(0, 0, w, h);
    return ctx.getImageData(0, 0, w, h);
  }

  // Warm cream background studio backdrop
  ctx.fillStyle = '#efe3ce';
  ctx.fillRect(0, 0, w, h);

  // Face oval with realistic Fitzpatrick III/IV warm undertone
  ctx.fillStyle = preset === 'post_blemish_marks' ? '#dba983' : '#e2b48e';
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.5, w * 0.35, h * 0.43, 0, 0, Math.PI * 2);
  ctx.fill();

  // Facial zone contours (T-zone, cheeks, nose bridge, chin)
  ctx.strokeStyle = '#b47c56';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(w * 0.37, h * 0.42, w * 0.055, Math.PI, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w * 0.63, h * 0.42, w * 0.055, Math.PI, 0);
  ctx.stroke();

  // Nose bridge & tip
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.38);
  ctx.lineTo(w * 0.48, h * 0.55);
  ctx.lineTo(w * 0.53, h * 0.55);
  ctx.stroke();

  // Lip line
  ctx.strokeStyle = '#b85d52';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(w * 0.41, h * 0.68);
  ctx.quadraticCurveTo(w * 0.5, h * 0.71, w * 0.59, h * 0.68);
  ctx.stroke();

  // Deterministic visible skin features & micro-texture so Laplacian sharpness passes (>35)
  const featureSpots =
    preset === 'post_blemish_marks'
      ? [
          { x: 0.33, y: 0.52, r: 4.2, color: '#8f4f32' }, // Cheek dark spot
          { x: 0.36, y: 0.56, r: 3.6, color: '#945538' }, // Cheek dark spot
          { x: 0.64, y: 0.53, r: 4.0, color: '#8c4c30' }, // Right cheek dark spot
          { x: 0.48, y: 0.25, r: 3.4, color: '#c44536' }, // Forehead blemish
          { x: 0.51, y: 0.75, r: 3.8, color: '#9c5637' }  // Chin mark
        ]
      : [
          { x: 0.45, y: 0.24, r: 4.5, color: '#c83e2b' }, // Forehead active blemish
          { x: 0.55, y: 0.27, r: 3.8, color: '#c83e2b' }, // Forehead blemish
          { x: 0.33, y: 0.51, r: 4.8, color: '#d14b38' }, // Left cheek blemish
          { x: 0.66, y: 0.50, r: 4.2, color: '#b56338' }, // Right cheek mark
          { x: 0.50, y: 0.51, r: 3.5, color: '#8d5336' }, // Nose pore/sebaceous feature
          { x: 0.49, y: 0.75, r: 4.3, color: '#c83e2b' }  // Chin blemish
        ];

  for (const s of featureSpots) {
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(w * s.x, h * s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f6d5b8';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Add realistic skin pore micro-contrast across T-zone & cheeks
  for (let i = 0; i < 95; i++) {
    const px = w * (0.26 + ((i * 37) % 48) / 100);
    const py = h * (0.20 + ((i * 53) % 58) / 100);
    ctx.fillStyle = i % 2 === 0 ? '#a86e49' : '#f1caa7';
    ctx.fillRect(px, py, 2, 2);
  }

  return ctx.getImageData(0, 0, w, h);
}

export const imageQualityGate = new ImageQualityGate();
