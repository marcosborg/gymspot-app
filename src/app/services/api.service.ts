import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {
    this.url = this.apiConfig.publicUrl;
    this.protected_url = this.apiConfig.protectedUrl;
    this.auth_url = this.apiConfig.authUrl;
  }

  url: any;
  protected_url: any;
  auth_url: any;

  httpOptions = {
    headers: new HttpHeaders({
      'Accept-Language': 'pt'
    })
  };

  private get(url: string, options?: any) {
    return this.http.get(url, options).pipe(
      map((response) => this.normalizeResponse(response))
    );
  }

  private post(url: string, body: any, options?: any) {
    return this.http.post(url, body, options).pipe(
      map((response) => this.normalizeResponse(response))
    );
  }

  getSliders() {
    return this.get(this.url + 'sliders');
  }

  getSteps() {
    return this.get(this.url + 'steps');
  }

  getMenus() {
    return this.get(this.url + 'menus');
  }

  getContentPage(content_page_id: any) {
    return this.get(this.url + 'content-pages/' + content_page_id);
  }

  getCategoryPages(content_category_id: any) {
    return this.get(this.url + 'content-categories/' + content_category_id);
  }

  getAbouts() {
    return this.get(this.url + 'abouts');
  }

  getServices() {
    return this.get(this.url + 'services');
  }

  getGalleries() {
    return this.get(this.url + 'galleries');
  }

  getLocations() {
    return this.get(this.url + 'locations');
  }

  getLocation(location_id: any) {
    return this.get(this.url + 'locations/' + location_id);
  }

  getFaqs() {
    return this.get(this.url + 'faq-questions');
  }

  getSpots(number: any = null) {
    let plus = '';
    if (number) {
      plus = '?limit=' + number;
    }
    return this.get(this.url + 'spots' + plus);
  }

  getSpot(spot_id: any) {
    return this.get(this.url + 'spots/' + spot_id);
  }

  getMonth() {
    return this.get(this.url + 'calendar/month');
  }

  changeMonth(link: string) {
    return this.get(this.url + 'calendar/month/' + link);
  }

  getDay(data: any) {
    return this.post(this.url + 'calendar/day', data);
  }

  getPts(number: any = null) {
    let limit = '';
    if (number) {
      limit = '?limit=' + number;
    }
    return this.get(this.url + 'personal-trainers' + limit);
  }

  getPt(personal_trainer_id: any) {
    return this.get(this.url + 'personal-trainers/' + personal_trainer_id);
  }

  register(data: any) {
    return this.post(this.auth_url + 'register', data, this.httpOptions);
  }

  login(data: any) {
    return this.post(this.auth_url + 'login', data, this.httpOptions).pipe(timeout(15000));
  }

  user(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.get(this.protected_url + 'user', this.httpOptions);
  }

  updateUser(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.post(this.protected_url + 'update-user', data.user, this.httpOptions);
  }

  updateClient(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.post(this.protected_url + 'update-client', data.client, this.httpOptions);
  }

  countries(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.get(this.protected_url + 'countries', this.httpOptions);
  }

  updateProfessionalData(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.post(this.protected_url + 'update-professional-data', data.personal_trainer, this.httpOptions);
  }

  saveProfilePhoto(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.post(this.protected_url + 'save-profile-photo', data.request, this.httpOptions);
  }

  saveOtherPhoto(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.post(this.protected_url + 'save-other-photo', data.request, this.httpOptions);
  }

  deletePhoto(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.get(this.protected_url + 'delete-photo/' + data.photo_id, this.httpOptions);
  }

  payByMbway(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.post(this.auth_url + 'payments/mbway', data, this.httpOptions);
  }

  checkMbwayStatus(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.get(this.auth_url + 'payments/check-mbway-status/' + data.requestId, this.httpOptions);
  }

  rentedSlots(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.get(this.protected_url + 'rented-slots', this.httpOptions);
  }

  payByMultibanco(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.post(this.auth_url + 'payments/multibanco', data, this.httpOptions);
  }

  payByBudget(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.post(this.auth_url + 'payments/pay-by-budget', data, this.httpOptions);
  }

  validateCartSlots(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.post(this.auth_url + 'payments/validate-cart-slots', data, this.httpOptions);
  }

  createClientData(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.post(this.protected_url + 'client-datas/create', data, this.httpOptions);
  }

  updateClientData(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.post(this.protected_url + 'client-datas/update', data, this.httpOptions);
  }

  startConversation(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.post(this.auth_url + 'guia-fitness/start-conversation', data, this.httpOptions);
  }

  sendMessage(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.post(this.auth_url + 'guia-fitness/send-message', data, this.httpOptions);
  }

  deleteAccount(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.post(this.auth_url + 'delete-account', data, this.httpOptions);
  }

  saveToken(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.post(this.auth_url + 'save-token', data, this.httpOptions);
  }

  myPacks(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.get(this.protected_url + 'my-packs', this.httpOptions);
  }

  packs() {
    return this.get(this.url + 'packs');
  }

  pack(pack_id: any) {
    return this.get(this.url + 'packs/' + pack_id);
  }

  validatePromoCode(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.post(this.protected_url + 'promo-codes/validate-promo-code', data, this.httpOptions);
  }

  private normalizeResponse<T>(response: T): T {
    if (!this.apiConfig.useRemoteMediaOrigin) {
      return response;
    }

    return this.walkValue(response) as T;
  }

  private walkValue(value: any): any {
    if (Array.isArray(value)) {
      return value.map((item) => this.walkValue(item));
    }

    if (value && typeof value === 'object') {
      Object.keys(value).forEach((key) => {
        const currentValue = value[key];

        if (typeof currentValue === 'string' && this.isMediaLikeKey(key)) {
          value[key] = this.rewriteMediaUrl(currentValue);
          return;
        }

        value[key] = this.walkValue(currentValue);
      });
    }

    return value;
  }

  private isMediaLikeKey(key: string): boolean {
    return ['original_url', 'url', 'thumbnail', 'preview'].includes(key);
  }

  private rewriteMediaUrl(url: string): string {
    if (!url) {
      return url;
    }

    if (url.startsWith('/storage/')) {
      return `${this.apiConfig.remoteOrigin}${url}`;
    }

    if (url.startsWith(`${this.apiConfig.localOrigin}/storage/`)) {
      return url.replace(this.apiConfig.localOrigin, this.apiConfig.remoteOrigin);
    }

    return url;
  }

}
