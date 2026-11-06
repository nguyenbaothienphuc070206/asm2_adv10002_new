/**
 * Thorakao Botanical AI Skin Lab — Full-Stack HTTP & Server-Side Gemini RAG Server
 * Features:
 * - Static asset serving for index.html, src/, and assets/ on port 3000
 * - Path traversal hardening (resolveSafePath)
 * - IP-based API rate limiting (60 req/min) & payload size sanitization
 * - Server-side @google/genai RAG endpoint (/api/assistant/query) with structured JSON schema,
 *   timeout, exponential backoff retry, info logging, and deterministic catalog fallback.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';
import { C } from './src/config/catalog.js';
import { PRODUCT_INGREDIENTS, PRODUCT_HOW_TO_USE } from './src/config/content.js';

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const GEMINI_MODEL = 'gemini-3.8-flash';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

/**
 * In-memory IP rate limiter for /api/* routes (Priority 10 Security)
 */
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQ = 60;

/**
 * Check whether an IP is within the allowed request rate
 * @param {string} ip
 * @returns {boolean}
 */
export function checkRateLimit(ip = '127.0.0.1') {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return true;
  }
  entry.count += 1;
  return entry.count <= RATE_LIMIT_MAX_REQ;
}

/**
 * Resolves a request URL path safely within ROOT_DIR
 * @param {string} urlPath
 * @returns {string|null} Absolute file path or null if outside root
 */
export function resolveSafePath(urlPath) {
  const decoded = decodeURIComponent((urlPath || '/').split('?')[0].split('#')[0]);
  const cleanPath = decoded === '/' ? '/index.html' : decoded;
  const resolved = path.resolve(ROOT_DIR, '.' + cleanPath);
  if (!resolved.startsWith(ROOT_DIR + path.sep) && resolved !== ROOT_DIR) {
    return null;
  }
  return resolved;
}

/**
 * Retrieve verified RAG context chunks for a user query
 * @param {string} query
 * @param {object|null} orderContext
 * @returns {{ sources: Array<{id: string, title: string, snippet: string}>, matchedProducts: string[] }}
 */
export function retrieveVerifiedContext(query = '', orderContext = null) {
  const q = String(query || '').toLowerCase();
  const sources = [];
  const matchedProducts = [];

  for (const p of Object.values(C)) {
    const ing = PRODUCT_INGREDIENTS[p.id] || '';
    const how = PRODUCT_HOW_TO_USE[p.id] || '';
    const tagsStr = Array.isArray(p.t) ? p.t.join(' ') : String(p.t || '');
    const textBlob = `${p.id} ${p.n} ${p.bf} ${p.b} ${ing} ${how} ${tagsStr}`.toLowerCase();
    const isMatch =
      q.includes(p.id) ||
      tagsStr
        .split(/\s+/)
        .filter(Boolean)
        .some((tag) => q.includes(tag)) ||
      (q.includes('turmeric') && textBlob.includes('turmeric')) ||
      (q.includes('nghệ') && (p.id === 'wash' || p.id === 'cream' || p.id === 'duo')) ||
      (q.includes('pomelo') || q.includes('bưởi') || q.includes('grapefruit')
        ? p.id === 'pomelo'
        : false) ||
      (q.includes('ginseng') || q.includes('sâm') ? p.id === 'ginseng' : false) ||
      (q.includes('soapberry') || q.includes('bồ kết') ? p.id === 'boket' : false) ||
      (q.includes('ginger') || q.includes('gừng') ? p.id === 'ginger' : false) ||
      (q.includes('toner') || q.includes('cucumber') || q.includes('hoa hồng')
        ? p.id === 'toner'
        : false) ||
      (q.includes('lip') || q.includes('môi') ? p.id === 'lip' : false);

    if (isMatch || matchedProducts.length < 3) {
      if (isMatch) matchedProducts.push(p.id);
      sources.push({
        id: `SKU:${p.id}`,
        title: `${p.n} (${p.p.toLocaleString('en-US')} VND)`,
        snippet: `Best for: ${p.bf}. Summary: ${p.b} Ingredients: ${ing} How to use: ${how}`
      });
    }
  }

  sources.push({
    id: 'POLICY:SHIPPING_RETURNS',
    title: 'Thorakao Official Store Policies & Contact',
    snippet:
      'Free shipping on orders over 199,000 VND (25,000 VND HCMC, 35,000 VND nationwide). 30-day unopened return policy. Vouchers: THORA10 (10%), THORA15 (15% over 120k), THORA20 (20% over 200k). Official phone: 028 8887 3241, email: info@thorakao.com.'
  });

  if (orderContext && orderContext.id) {
    sources.unshift({
      id: `ORDER:${orderContext.id}`,
      title: `Live Order Status #${orderContext.id}`,
      snippet: `Status: ${orderContext.status}. Total: ${orderContext.total} VND. Created: ${orderContext.createdAt}. City: ${orderContext.city || 'HCMC'}.`
    });
  }

  return {
    sources: sources.slice(0, 5),
    matchedProducts: matchedProducts.length ? matchedProducts.slice(0, 3) : ['duo', 'wash']
  };
}

/**
 * Deterministic RAG fallback response when Gemini API key is absent or unavailable
 * @param {string} query
 * @param {string} lang
 * @param {object|null} orderContext
 * @returns {object}
 */
export function buildDeterministicRagFallback(query = '', lang = 'en', orderContext = null) {
  const isVi = lang === 'vi';
  const { sources, matchedProducts } = retrieveVerifiedContext(query, orderContext);
  const q = String(query || '').toLowerCase();

  let answer;
  let uncertaintyNote = isVi
    ? 'Chỉ cung cấp thông tin mỹ phẩm dựa trên nhãn sản phẩm Thorakao đã xác minh; không thay thế chẩn đoán y khoa.'
    : 'Grounded strictly in verified Thorakao product labels; cosmetic guidance only, not a medical diagnosis.';
  let needsHumanEscalation = false;

  if (orderContext && orderContext.id) {
    answer = isVi
      ? `Đơn hàng #${orderContext.id} của bạn hiện ở trạng thái "${orderContext.status}" với tổng giá trị ${Number(
          orderContext.total || 0
        ).toLocaleString('en-US')} VND. Thời gian giao dự kiến tại TP.HCM là 1–2 ngày làm việc.`
      : `Your order #${orderContext.id} is currently "${orderContext.status}" with a total of ${Number(
          orderContext.total || 0
        ).toLocaleString('en-US')} VND. Estimated delivery is 1–2 business days in HCMC.`;
  } else if (q.includes('severe') || q.includes('bleed') || q.includes('pain') || q.includes('đau') || q.includes('viêm nặng')) {
    needsHumanEscalation = true;
    answer = isVi
      ? 'Nếu làn da của bạn đang bị đau rát, sưng viêm nặng hoặc kích ứng kéo dài, vui lòng ngưng sử dụng mỹ phẩm và tham khảo ý kiến bác sĩ da liễu. Bạn cũng có thể liên hệ bộ phận hỗ trợ của Thorakao qua số 028 8887 3241.'
      : 'If your skin is painful, severely inflamed, or experiencing persistent irritation, please pause cosmetic products and consult a dermatologist. You can also escalate to Thorakao customer support at 028 8887 3241.';
  } else {
    const primaryProducts = matchedProducts.map((id) => C[id]).filter(Boolean);
    const listText = primaryProducts
      .map(
        (p) =>
          `${p.n} (${p.p.toLocaleString('en-US')} VND — ${p.bf}; ${PRODUCT_INGREDIENTS[p.id] || ''})`
      )
      .join(' | ');
    answer = isVi
      ? `Dựa trên cơ sở dữ liệu sản phẩm chính hãng Thorakao từ năm 1961, gợi ý phù hợp nhất cho câu hỏi của bạn là: ${listText}. Luôn thử trước trên vùng da nhỏ và dùng kem chống nắng vào buổi sáng.`
      : `Based on verified Thorakao formulation data since 1961, the most relevant products for your request are: ${listText}. Always patch test on a small area first and apply sunscreen every morning.`;
  }

  return {
    answer,
    recommendedSkus: matchedProducts,
    citations: sources.map((s) => `${s.id}: ${s.title}`),
    uncertaintyNote,
    needsHumanEscalation,
    retrievalSteps: [
      isVi ? '1. Chuẩn hóa câu hỏi & lọc từ khóa thảo mộc' : '1. Normalized query & extracted botanical entities',
      isVi ? `2. Truy xuất ${sources.length} tài liệu nhãn Thorakao chính hãng` : `2. Retrieved ${sources.length} verified Thorakao catalog & policy chunks`,
      isVi ? '3. Đối chiếu giá bán, thành phần & tạo câu trả lời có trích dẫn' : '3. Grounded prices, ingredients & synthesized cited response'
    ],
    isFallback: true,
    model: `${GEMINI_MODEL} (Deterministic RAG Fallback)`
  };
}

/**
 * Call Gemini 3.8 Flash with structured JSON output, timeout, and exponential backoff retry
 * @param {string} query
 * @param {string} lang
 * @param {object|null} orderContext
 * @returns {Promise<object>}
 */
async function queryGeminiRagAssistant(query, lang = 'en', orderContext = null) {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  const { sources, matchedProducts } = retrieveVerifiedContext(query, orderContext);

  if (!apiKey) {
    console.info(
      JSON.stringify({
        level: 'info',
        fn: 'queryGeminiRagAssistant',
        model: GEMINI_MODEL,
        inputLength: String(query || '').length,
        durationMs: Date.now() - startTime,
        status: 'fallback_no_api_key'
      })
    );
    return buildDeterministicRagFallback(query, lang, orderContext);
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  const contextBlock = sources
    .map((s) => `[${s.id}] ${s.title}: ${s.snippet}`)
    .join('\n');

  const systemInstruction =
    'You are the Thorakao Botanical AI Customer Assistant, grounded strictly in the provided verified Thorakao catalog, formulation ingredients, and store policies. ' +
    'Never invent prices, ingredients, medical claims, or unverified policies. ' +
    'If the user describes severe pain or medical skin conditions, set needsHumanEscalation to true and advise seeing a dermatologist. ' +
    `Respond in ${lang === 'vi' ? 'Vietnamese' : 'English'} in under 110 words.`;

  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('GEMINI_TIMEOUT')), 7500)
      );

      const genPromise = ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `VERIFIED THORAKAO CONTEXT:\n${contextBlock}\n\nUSER QUESTION:\n${String(
          query || ''
        ).slice(0, 600)}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: {
                type: Type.STRING,
                description: 'Grounded response citing only verified Thorakao products and prices.'
              },
              recommendedSkus: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Array of valid Thorakao SKU IDs such as wash, cream, toner, lip, duo, routine, pomelo, ginseng, boket, ginger.'
              },
              citations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Cited context IDs used to answer.'
              },
              uncertaintyNote: {
                type: Type.STRING,
                description: 'Non-medical cosmetic guidance disclaimer or uncertainty note.'
              },
              needsHumanEscalation: {
                type: Type.BOOLEAN,
                description: 'True if user requires dermatologist or human support escalation.'
              }
            },
            required: ['answer', 'recommendedSkus', 'citations', 'uncertaintyNote', 'needsHumanEscalation']
          }
        }
      });

      const response = await Promise.race([genPromise, timeoutPromise]);
      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);

      if (!parsed || typeof parsed.answer !== 'string' || !parsed.answer.trim()) {
        throw new Error('INVALID_SCHEMA_OUTPUT');
      }

      const validSkus = Array.isArray(parsed.recommendedSkus)
        ? parsed.recommendedSkus.filter((id) => C[id])
        : matchedProducts;

      console.info(
        JSON.stringify({
          level: 'info',
          fn: 'queryGeminiRagAssistant',
          model: GEMINI_MODEL,
          inputLength: String(query || '').length,
          durationMs: Date.now() - startTime,
          status: 'success',
          attempt
        })
      );

      return {
        answer: parsed.answer,
        recommendedSkus: validSkus.length ? validSkus : matchedProducts,
        citations:
          Array.isArray(parsed.citations) && parsed.citations.length
            ? parsed.citations
            : sources.map((s) => `${s.id}: ${s.title}`),
        uncertaintyNote: parsed.uncertaintyNote || 'Cosmetic guidance only, not a medical diagnosis.',
        needsHumanEscalation: Boolean(parsed.needsHumanEscalation),
        retrievalSteps: [
          lang === 'vi'
            ? '1. Chuẩn hóa câu hỏi & lọc từ khóa thảo mộc'
            : '1. Normalized query & extracted botanical entities',
          lang === 'vi'
            ? `2. Truy xuất ${sources.length} tài liệu nhãn Thorakao chính hãng`
            : `2. Retrieved ${sources.length} verified Thorakao catalog & policy chunks`,
          lang === 'vi'
            ? `3. Tổng hợp câu trả lời có kiểm chứng qua ${GEMINI_MODEL}`
            : `3. Synthesized schema-validated response via ${GEMINI_MODEL}`
        ],
        isFallback: false,
        model: GEMINI_MODEL
      };
    } catch (err) {
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      } else {
        console.info(
          JSON.stringify({
            level: 'info',
            fn: 'queryGeminiRagAssistant',
            model: GEMINI_MODEL,
            inputLength: String(query || '').length,
            durationMs: Date.now() - startTime,
            status: 'fallback_after_error',
            reason: err instanceof Error ? err.message : 'unknown'
          })
        );
      }
    }
  }

  return buildDeterministicRagFallback(query, lang, orderContext);
}

const serverMetrics = {
  startedAt: new Date().toISOString(),
  totalApiRequests: 0,
  ragAssistantCalls: 0,
  recentTraces: []
};

function recordServerTrace(route, method, status, durationMs, correlationId) {
  serverMetrics.recentTraces.unshift({
    correlationId,
    route,
    method,
    status,
    durationMs,
    timestamp: new Date().toISOString()
  });
  if (serverMetrics.recentTraces.length > 20) {
    serverMetrics.recentTraces.length = 20;
  }
}

export const server = http.createServer((req, res) => {
  const reqStart = Date.now();
  const correlationId =
    req.headers['x-correlation-id'] ||
    'thk-trace-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  const urlObj = new URL(req.url || '/', `http://localhost:${PORT}`);
  const pathname = urlObj.pathname;

  // API Routes (/api/*)
  if (pathname.startsWith('/api/')) {
    serverMetrics.totalApiRequests += 1;
    const clientIp = req.socket?.remoteAddress || '127.0.0.1';
    if (!checkRateLimit(clientIp)) {
      recordServerTrace(pathname, req.method, 429, Date.now() - reqStart, correlationId);
      res.writeHead(429, {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Correlation-ID': correlationId
      });
      res.end(JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment.' }));
      return;
    }

    if (pathname === '/api/health' && req.method === 'GET') {
      recordServerTrace(pathname, 'GET', 200, Date.now() - reqStart, correlationId);
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Correlation-ID': correlationId
      });
      res.end(
        JSON.stringify({
          status: 'ok',
          model: GEMINI_MODEL,
          yoloVersion: 'yolov8n-thorakao-skin-v8.2',
          skuCount: Object.keys(C).length,
          correlationId
        })
      );
      return;
    }

    if (pathname === '/api/enterprise/status' && req.method === 'GET') {
      recordServerTrace(pathname, 'GET', 200, Date.now() - reqStart, correlationId);
      const mem = process.memoryUsage();
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Correlation-ID': correlationId
      });
      res.end(
        JSON.stringify({
          status: 'healthy',
          readiness: 'ready',
          liveness: 'alive',
          uptimeSeconds: Math.round(process.uptime()),
          startedAt: serverMetrics.startedAt,
          memoryRssMb: Number((mem.rss / (1024 * 1024)).toFixed(1)),
          heapUsedMb: Number((mem.heapUsed / (1024 * 1024)).toFixed(1)),
          totalApiRequests: serverMetrics.totalApiRequests,
          ragAssistantCalls: serverMetrics.ragAssistantCalls,
          rateLimiterActiveClients: rateLimitMap.size,
          recentTraces: serverMetrics.recentTraces.slice(0, 6),
          correlationId
        })
      );
      return;
    }

    if (pathname === '/api/assistant/query' && req.method === 'POST') {
      serverMetrics.ragAssistantCalls += 1;
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > 32_768) {
          req.destroy();
        }
      });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body || '{}');
          const cleanQuery = String(payload.query || '')
            .replace(/[<>]/g, '')
            .trim()
            .slice(0, 500);
          const lang = payload.lang === 'vi' ? 'vi' : 'en';
          const orderContext =
            payload.orderContext && typeof payload.orderContext === 'object'
              ? payload.orderContext
              : null;

          if (!cleanQuery) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: 'Query is required.' }));
            return;
          }

          const result = await queryGeminiRagAssistant(cleanQuery, lang, orderContext);
          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Content-Type-Options': 'nosniff'
          });
          res.end(JSON.stringify(result));
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Invalid JSON request payload.' }));
        }
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'API route not found.' }));
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  let filePath;
  try {
    filePath = resolveSafePath(req.url);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad Request');
    return;
  }

  if (!filePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    let targetPath = filePath;
    if (err || !stats.isFile()) {
      const ext = path.extname(targetPath);
      if (!ext) {
        const htmlCandidate = targetPath + '.html';
        if (fs.existsSync(htmlCandidate) && fs.statSync(htmlCandidate).isFile()) {
          targetPath = htmlCandidate;
        } else {
          targetPath = path.join(ROOT_DIR, 'index.html');
        }
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
        return;
      }
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const headers = {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    if (targetPath.includes(path.sep + 'assets' + path.sep)) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else {
      headers['Cache-Control'] = 'no-cache';
    }

    res.writeHead(200, headers);
    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    const stream = fs.createReadStream(targetPath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      }
      res.end('Internal Server Error');
    });
    stream.pipe(res);
  });
});

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Thorakao server listening on http://localhost:${PORT}`);
  });
}
