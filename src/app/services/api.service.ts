import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  constructor(
    private http: HttpClient
  ) {
    if (this.sandbox) {
      this.url = 'http://127.0.0.1:8000/api/v2/';
      this.protected_url = 'http://127.0.0.1:8000/api/v1/';
      this.auth_url = 'http://127.0.0.1:8000/api/';
    } else {
      this.url = 'https://gymspot.pt/api/v2/';
      this.protected_url = 'https://gymspot.pt/api/v1/';
      this.auth_url = 'https://gymspot.pt/api/';
    }
  }

  sandbox: boolean = false;

  url: any;
  protected_url: any;
  auth_url: any;

  httpOptions = {
    headers: new HttpHeaders({
      'Accept-Language': 'pt'
    })
  };

  getSliders() {
    return this.http.get(this.url + 'sliders');
  }

  getSteps() {
    return this.http.get(this.url + 'steps');
  }

  getMenus() {
    return this.http.get(this.url + 'menus');
  }

  getContentPage(content_page_id: any) {
    return this.http.get(this.url + 'content-pages/' + content_page_id);
  }

  getCategoryPages(content_category_id: any) {
    return this.http.get(this.url + 'content-categories/' + content_category_id);
  }

  getAbouts() {
    return this.http.get(this.url + 'abouts');
  }

  getServices() {
    return this.http.get(this.url + 'services');
  }

  getGalleries() {
    return this.http.get(this.url + 'galleries');
  }

  getLocations() {
    return this.http.get(this.url + 'locations');
  }

  getLocation(location_id: any) {
    return this.http.get(this.url + 'locations/' + location_id);
  }

  getFaqs() {
    return this.http.get(this.url + 'faq-questions');
  }

  getSpots(number: any = null) {
    let plus = '';
    if (number) {
      plus = '?limit=' + number;
    }
    return this.http.get(this.url + 'spots' + plus);
  }

  getSpot(spot_id: any) {
    return this.http.get(this.url + 'spots/' + spot_id);
  }

  getMonth() {
    return this.http.get(this.url + 'calendar/month');
  }

  changeMonth(link: string) {
    return this.http.get(this.url + 'calendar/month/' + link);
  }

  getDay(data: any) {
    return this.http.post(this.url + 'calendar/day', data);
  }

  getPts(number: any = null) {
    let limit = '';
    if (number) {
      limit = '?limit=' + number;
    }
    return this.http.get(this.url + 'personal-trainers' + limit);
  }

  getPt(personal_trainer_id: any) {
    return this.http.get(this.url + 'personal-trainers/' + personal_trainer_id);
  }

  register(data: any) {
    return this.http.post(this.auth_url + 'register', data, this.httpOptions);
  }

  login(data: any) {
    return this.http.post(this.auth_url + 'login', data, this.httpOptions);
  }

  user(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.get(this.protected_url + 'user', this.httpOptions);
  }

  updateUser(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.post(this.protected_url + 'update-user', data.user, this.httpOptions);
  }

  updateClient(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.post(this.protected_url + 'update-client', data.client, this.httpOptions);
  }

  countries(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.get(this.protected_url + 'countries', this.httpOptions);
  }

  updateProfessionalData(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.post(this.protected_url + 'update-professional-data', data.personal_trainer, this.httpOptions);
  }

  saveProfilePhoto(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.post(this.protected_url + 'save-profile-photo', data.request, this.httpOptions);
  }

  saveOtherPhoto(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.post(this.protected_url + 'save-other-photo', data.request, this.httpOptions);
  }

  deletePhoto(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.get(this.protected_url + 'delete-photo/' + data.photo_id, this.httpOptions);
  }

  payByMbway(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.post(this.auth_url + 'payments/mbway', data, this.httpOptions);
  }

  checkMbwayStatus(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.get(this.auth_url + 'payments/check-mbway-status/' + data.requestId, this.httpOptions);
  }

  rentedSlots(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.get(this.protected_url + 'rented-slots', this.httpOptions);
  }

  payByMultibanco(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.post(this.auth_url + 'payments/multibanco', data, this.httpOptions);
  }

  payByBudget(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.post(this.auth_url + 'payments/pay-by-budget', data, this.httpOptions);
  }

  createClientData(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.post(this.protected_url + 'client-datas/create', data, this.httpOptions);
  }

  updateClientData(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.post(this.protected_url + 'client-datas/update', data, this.httpOptions);
  }

  startConversation(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.post(this.auth_url + 'guia-fitness/start-conversation', data, this.httpOptions);
  }

  sendMessage(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.post(this.auth_url + 'guia-fitness/send-message', data, this.httpOptions);
  }

  deleteAccount(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.post(this.auth_url + 'delete-account', data, this.httpOptions);
  }

  saveToken(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.post(this.auth_url + 'save-token', data, this.httpOptions);
  }

  myPacks(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.get(this.protected_url + 'my-packs', this.httpOptions);
  }

  packs() {
    return this.http.get(this.url + 'packs');
  }

  pack(pack_id: any) {
    return this.http.get(this.url + 'packs/' + pack_id);
  }

  validatePromoCode(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.post(this.protected_url + 'promo-codes/validate-promo-code', data, this.httpOptions);
  }

}
