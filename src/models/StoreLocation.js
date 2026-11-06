/**
 * Store Location Domain Model
 */
export class StoreLocation {
  constructor(data) {
    this.id = data.id;
    this.city = data.city;
    this.name = data.n;
    this.address = data.addr || '';
    this.phone = data.phone || '';
    this.query = data.q;
    this.note = data.note || '';
  }

  getSearchUrl() {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(this.query);
  }

  getDirectionsUrl() {
    return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(this.query);
  }

  getEmbedUrl(apiKey = '', lang = 'en') {
    const q = encodeURIComponent(this.query);
    if (apiKey) {
      return `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${q}`;
    }
    return `https://www.google.com/maps?q=${q}&output=embed&hl=${lang}`;
  }
}
