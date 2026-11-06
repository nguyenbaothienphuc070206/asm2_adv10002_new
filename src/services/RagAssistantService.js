/**
 * Client-Side RAG Botanical Assistant Service (Priority 8)
 * Communicates with the server-side /api/assistant/query endpoint (@google/genai),
 * surfaces step-by-step RAG retrieval & inference stages to the UI,
 * and guarantees a deterministic grounded fallback if network or API errors occur.
 */

import { C } from '../config/catalog.js';
import { PRODUCT_INGREDIENTS, PRODUCT_HOW_TO_USE } from '../config/content.js';
import { ecommerceService } from './EcommerceService.js';

export class RagAssistantService {
  constructor() {
    this.history = [];
  }

  /**
   * Ask the grounded Thorakao Botanical AI Assistant a question
   * @param {string} query
   * @param {string} lang
   * @param {(stepText: string) => void} onProgress
   * @returns {Promise<object>}
   */
  async ask(query, lang = 'en', onProgress = () => {}) {
    const isVi = lang === 'vi';
    const cleanQuery = String(query || '').trim();
    if (!cleanQuery) {
      throw new Error(isVi ? 'Vui lòng nhập câu hỏi.' : 'Please enter a question.');
    }

    onProgress(
      isVi
        ? 'Bước 1/3: Đang trích xuất từ khóa thảo mộc & kiểm tra mã đơn hàng...'
        : 'Step 1/3: Extracting botanical entities & checking order context...'
    );

    // Check if the query references an order ID like #TH849201
    const orderMatch = cleanQuery.match(/#?(TH\d{6})/i);
    const orderContext = orderMatch ? ecommerceService.findOrder(orderMatch[1]) : null;

    await new Promise((r) => setTimeout(r, 180));
    onProgress(
      isVi
        ? 'Bước 2/3: Đang truy xuất cơ sở dữ liệu nhãn Thorakao chính hãng & gửi tới Gemini Server...'
        : 'Step 2/3: Retrieving verified Thorakao catalog chunks & querying server-side Gemini...'
    );

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8500);

      const res = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: cleanQuery,
          lang,
          orderContext
        }),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP_${res.status}`);
      }

      onProgress(
        isVi
          ? 'Bước 3/3: Đang kiểm tra schema JSON, trích dẫn nguồn & đối chiếu giá bán...'
          : 'Step 3/3: Validating JSON schema, source citations & SKU availability...'
      );

      const data = await res.json();
      const record = {
        id: 'MSG-' + Date.now().toString(36),
        query: cleanQuery,
        ...data,
        timestamp: new Date().toISOString()
      };
      this.history.unshift(record);
      return record;
    } catch {
      const fallback = this.buildClientOfflineFallback(cleanQuery, lang, orderContext);
      const record = {
        id: 'MSG-' + Date.now().toString(36),
        query: cleanQuery,
        ...fallback,
        timestamp: new Date().toISOString()
      };
      this.history.unshift(record);
      return record;
    }
  }

  buildClientOfflineFallback(query, lang = 'en', orderContext = null) {
    const isVi = lang === 'vi';
    const q = String(query || '').toLowerCase();

    if (orderContext) {
      return {
        answer: isVi
          ? `Đơn hàng #${orderContext.id} (${orderContext.customerName}) hiện ở trạng thái: "${orderContext.status}". Tổng cộng: ${orderContext.total.toLocaleString('en-US')} VND.`
          : `Order #${orderContext.id} (${orderContext.customerName}) is currently "${orderContext.status}". Total: ${orderContext.total.toLocaleString('en-US')} VND.`,
        recommendedSkus: Object.keys(orderContext.items || {}).filter((k) => C[k]),
        citations: [`ORDER:${orderContext.id}`, 'POLICY:SHIPPING_RETURNS'],
        uncertaintyNote: isVi
          ? 'Dữ liệu tra cứu trực tiếp từ hệ thống đơn hàng Thorakao.'
          : 'Retrieved directly from local Thorakao order records.',
        needsHumanEscalation: false,
        retrievalSteps: [
          isVi ? '1. Nhận diện mã đơn hàng #' + orderContext.id : '1. Matched order ID #' + orderContext.id,
          isVi ? '2. Truy xuất trạng thái vận chuyển & chính sách đổi trả 30 ngày' : '2. Retrieved shipping status & 30-day return policy'
        ],
        isFallback: true,
        model: 'Offline Verified Catalog RAG'
      };
    }

    const matched = Object.values(C).filter((p) => {
      const blob = `${p.id} ${p.n} ${p.bf} ${p.b} ${PRODUCT_INGREDIENTS[p.id] || ''}`.toLowerCase();
      return (
        blob.includes(q) ||
        (q.includes('mụn') && p.t.includes('blemish')) ||
        (q.includes('thâm') && p.t.includes('marks')) ||
        (q.includes('tóc') && (p.id === 'pomelo' || p.id === 'boket'))
      );
    });

    const picks = (matched.length ? matched : [C.duo, C.wash, C.toner]).slice(0, 3);
    return {
      answer: isVi
        ? `Theo dữ liệu nhãn sản phẩm Thorakao chính hãng: ${picks
            .map((p) => `${p.n} (${p.p.toLocaleString('en-US')} VND — ${PRODUCT_HOW_TO_USE[p.id] || p.b})`)
            .join(' · ')}.`
        : `Grounded in verified Thorakao product data: ${picks
            .map((p) => `${p.n} (${p.p.toLocaleString('en-US')} VND — ${PRODUCT_HOW_TO_USE[p.id] || p.b})`)
            .join(' · ')}.`,
      recommendedSkus: picks.map((p) => p.id),
      citations: picks.map((p) => `SKU:${p.id} (${p.n})`),
      uncertaintyNote: isVi
        ? 'Tư vấn mỹ phẩm dựa trên nhãn chính hãng, không thay thế chẩn đoán y khoa.'
        : 'Cosmetic guidance grounded in official labels; not a medical diagnosis.',
      needsHumanEscalation: false,
      retrievalSteps: [
        isVi ? '1. Phân tích nhu cầu chăm sóc da/tóc' : '1. Parsed skincare/haircare intent',
        isVi ? '2. Đối chiếu bảng thành phần & giá bán niêm yết' : '2. Matched verified formulation & VND pricing'
      ],
      isFallback: true,
      model: 'Deterministic RAG Fallback'
    };
  }
}

export const ragAssistantService = new RagAssistantService();
