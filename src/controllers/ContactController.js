import { EMAIL_REGEX } from '../config/constants.js';
import { mapService } from '../services/MapService.js';
import { analyticsService } from '../services/AnalyticsService.js';
import { $ } from '../utils/dom.js';

/**
 * Contact and Store Locator Controller
 */
export class ContactController {
  constructor() {
    this.locations = mapService.locations;
  }

  renderLocations() {
    const lcity = $('#lcity');
    if (!lcity) return;

    const currentCity = lcity.value;
    const list = this.locations.filter((l) => l.city === currentCity);

    if (!list.some((l) => l.id === mapService.selectedLocationId)) {
      if (list[0]) mapService.setSelectedLocationId(list[0].id);
    }

    const lloc = $('#lloc');
    if (lloc) {
      lloc.innerHTML = list
        .map(
          (l) =>
            `<li><button type="button" data-loc="${l.id}" aria-current="${
              l.id === mapService.selectedLocationId
            }"><b>${l.name}</b>${l.address ? `<br><span class="small">${l.address}</span>` : ''}${
              l.phone ? `<br><span class="small">Phone: ${l.phone}</span>` : ''
            }<br><span class="small">${l.note}</span></button></li>`
        )
        .join('');
    }

    mapService.renderMap();
  }

  handleCityChange() {
    this.renderLocations();
  }

  handleLocationSelect(locId) {
    mapService.setSelectedLocationId(locId);
    this.renderLocations();
  }

  handleContactSubmit(form) {
    const errors = [];
    const n = $('#cfn') ? $('#cfn').value.trim() : '';
    const em = $('#cfe') ? $('#cfe').value.trim() : '';
    const m = $('#cfm') ? $('#cfm').value.trim() : '';

    if (!n) errors.push(['cfn', 'Please enter your name.']);
    if (!EMAIL_REGEX.test(em)) {
      errors.push(['cfe', 'Please enter a valid email, like name@email.com.']);
    }
    if (m.length < 10) {
      errors.push(['cfm', 'Please write at least 10 characters.']);
    }

    const cfer = $('#cfer');
    if (cfer) {
      cfer.innerHTML = errors.length
        ? '<b>Please fix:</b><ul>' +
          errors
            .map(
              (x) => `<li><button type="button" class="lnk" data-focus="${x[0]}">${x[1]}</button></li>`
            )
            .join('') +
          '</ul>'
        : '';
    }

    if (errors.length) {
      const firstField = $('#' + errors[0][0]);
      if (firstField) firstField.focus();
      return;
    }

    analyticsService.track('contact_submit');
    form.hidden = true;
    const cfok = $('#cfok');
    if (cfok) cfok.hidden = false;
  }
}

export const contactController = new ContactController();
