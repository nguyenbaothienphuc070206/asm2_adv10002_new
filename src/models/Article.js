/**
 * Article Domain Model
 */
export class Article {
  constructor(data) {
    // data: [id, category, imageKey, title, readTime, content, relatedProductId]
    this.id = data[0];
    this.category = data[1];
    this.imageKey = data[2];
    this.title = data[3];
    this.readTime = data[4];
    this.content = data[5];
    this.relatedProductId = data[6];
  }
}
