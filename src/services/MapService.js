import { storageService } from './StorageService.js';
import { StoreLocation } from '../models/StoreLocation.js';
import { STORE_LOCATIONS } from '../config/content.js';
import { GMAPS_KEY } from '../config/constants.js';
import { i18nService } from './I18nService.js';
import { $ } from '../utils/dom.js';

/**
 * Google Maps and Store Locator Service
 */
export class MapService {
  constructor() {
    this.locations = STORE_LOCATIONS.map((data) => new StoreLocation(data));
    this.selectedLocationId = 'hq';
  }

  getSelectedLocation() {
    return (
      this.locations.find((l) => l.id === this.selectedLocationId) || this.locations[0]
    );
  }

  setSelectedLocationId(id) {
    this.selectedLocationId = id;
  }

  hasConsent() {
    return Boolean(storageService.get('maps', 0));
  }

  grantConsent() {
    storageService.set('maps', 1);
  }

  renderMap() {
    const loc = this.getSelectedLocation();
    const mopen = $('#mopen');
    const mdir = $('#mdir');
    const box = $('#mapbox');

    if (mopen) mopen.href = loc.getSearchUrl();
    if (mdir) mdir.href = loc.getDirectionsUrl();

    if (!box) return;

    if (this.hasConsent()) {
      box.innerHTML = `<iframe title="Google Map: ${loc.name}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen src="${loc.getEmbedUrl(GMAPS_KEY, i18nService.lang)}"></iframe>`;
    } else {
      box.innerHTML = `<div><p><b>Show the map</b></p><p class="small" style="margin:8px 0 14px">Loading the map shares your visit with Google. The map stays closed until you choose to show it.</p><button type="button" class="pill" data-map>Show map</button></div>`;
    }
  }
}

export const mapService = new MapService();
