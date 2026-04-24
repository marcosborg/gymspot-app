import { Component, OnInit } from '@angular/core';
import {
  AlertController,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';

import { HeaderComponent } from '../components/header/header.component';
import { CartButtonComponent } from '../components/cart-button/cart-button.component';
import { ApiService } from '../services/api.service';
import { PreferencesService } from '../services/preferences.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    HeaderComponent,
    IonList,
    IonItem,
    IonInput,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonButton,
    IonIcon,
    CommonModule,
    FormsModule,
    IonSelect,
    IonSelectOption,
    CartButtonComponent,
  ],
})
export class Tab3Page implements OnInit {
  access_token: any;
  create = false;
  user: any = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  };
  client: any = {
    name: '',
    zip: '',
    location: '',
    country_id: 170,
    phone: '',
    vat: '',
  };
  password: any;
  password_confirmation: any;
  countries: any[] = [];
  showRegisterPassword = false;
  showRegisterPasswordConfirmation = false;
  showLoginPassword = false;

  isSubmitting = false;

  constructor(
    private api: ApiService,
    private loadingController: LoadingController,
    private preferences: PreferencesService,
    private alertController: AlertController,
    private router: Router
  ) {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  ngOnInit() {
    this.inicialize();
  }

  async inicialize() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.user = {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    };
    this.client = {
      name: '',
      zip: '',
      location: '',
      country_id: 170,
      phone: '',
      vat: '',
    };
    this.password = null;
    this.password_confirmation = null;
    this.countries = [];

    try {
      const resp: any = await this.preferences.checkName('access_token');

      if (!resp.value) {
        this.access_token = null;
        await loading.dismiss();
        return;
      }

      this.access_token = resp.value;
      const data = { access_token: this.access_token };
      const userResp: any = await firstValueFrom(this.api.user(data));

      this.user = userResp;

      if (this.user?.client) {
        this.client = this.user.client;
      }

      const countriesResp: any = await firstValueFrom(this.api.countries(data));
      this.countries = countriesResp.data ?? [];
    } catch (err) {
      console.log(err);
      await this.logout(false);
    } finally {
      await loading.dismiss();
    }
  }

  toggleRegisterPassword() {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  toggleRegisterPasswordConfirmation() {
    this.showRegisterPasswordConfirmation = !this.showRegisterPasswordConfirmation;
  }

  toggleLoginPassword() {
    this.showLoginPassword = !this.showLoginPassword;
  }

  updateUserField(field: string, event: any) {
    this.user[field] = event?.detail?.value ?? '';
  }

  updateClientField(field: string, event: any) {
    this.client[field] = event?.detail?.value ?? '';
  }

  updatePasswordField(field: 'password' | 'password_confirmation', event: any) {
    this[field] = event?.detail?.value ?? '';
  }

  private async flushFocusedInput(): Promise<void> {
    const activeElement = document.activeElement as HTMLElement | null;

    if (activeElement && typeof activeElement.blur === 'function') {
      activeElement.blur();
    }

    await new Promise((resolve) => setTimeout(resolve, 75));
  }

  private buildValidationMessage(err: any, fallback: string): string {
    const duplicateEmailMessage = this.buildDuplicateEmailMessage(err);
    if (duplicateEmailMessage) {
      return duplicateEmailMessage;
    }

    const apiErrors = err?.error?.errors;
    if (!apiErrors) {
      return fallback;
    }

    let message = '';
    for (const field in apiErrors) {
      if (Object.prototype.hasOwnProperty.call(apiErrors, field)) {
        apiErrors[field].forEach((line: string) => {
          message += `${line}. `;
        });
      }
    }

    return message || fallback;
  }

  private buildDuplicateEmailMessage(err: any): string | null {
    const errorMessage = String(err?.error?.message ?? '').toLowerCase();
    const emailErrors = Array.isArray(err?.error?.errors?.email) ? err.error.errors.email : [];
    const combinedEmailErrors = emailErrors.join(' ').toLowerCase();

    const looksLikeDuplicateEmail = errorMessage.includes('users_email_unique')
      || errorMessage.includes('duplicate entry')
      || combinedEmailErrors.includes('already been taken')
      || combinedEmailErrors.includes('já foi utilizado')
      || combinedEmailErrors.includes('ja foi utilizado');

    if (!looksLikeDuplicateEmail) {
      return null;
    }

    return 'Já existe uma conta com este email. Faça login ou recupere a password.';
  }

  async login() {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    await this.flushFocusedInput();

    try {
      const resp: any = await firstValueFrom(this.api.login(this.user));
      this.access_token = resp.access_token;
      await this.preferences.setName('access_token', this.access_token);

      const alert = await this.alertController.create({
        header: 'Parabens!',
        message: 'Pode reservar em GymSpot',
        backdropDismiss: false,
        buttons: [
          {
            text: 'Continuar',
            handler: () => {
              this.inicialize();
            }
          }
        ]
      });

      await alert.present();
    } catch (err: any) {
      const message = err?.name === 'TimeoutError'
        ? 'A ligacao demorou demasiado tempo. Tente novamente.'
        : this.buildValidationMessage(err, 'Nao foi possivel ligar ao servidor. Verifique a ligacao e tente novamente.');

      const alert = await this.alertController.create({
        header: 'Erro no login',
        message,
        buttons: [
          {
            text: 'Tentar novamente',
            role: 'cancel'
          },
          {
            text: 'Pedir recuperacao de password',
            handler: () => {
              window.location.href = 'https://gymspot.pt/password/reset';
            }
          }
        ]
      });

      await alert.present();
    } finally {
      this.isSubmitting = false;
    }
  }

  async register() {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    await this.flushFocusedInput();
    try {
      await firstValueFrom(this.api.register(this.user));

      const alert = await this.alertController.create({
        header: 'Conta criada com sucesso',
        message: 'A sua conta já está ativa. Pode fazer login de imediato.',
        backdropDismiss: false,
        buttons: [
          {
            text: 'Continuar',
            handler: () => {
              this.create = false;
            }
          },
        ]
      });

      await alert.present();
    } catch (err: any) {
      console.log(err);

      const alert = await this.alertController.create({
        header: 'Erro de validacao',
        message: this.buildValidationMessage(err, 'Nao foi possivel concluir o registo. Tente novamente.'),
        buttons: [
          {
            text: 'Tentar novamente',
            role: 'cancel'
          },
          {
            text: 'Pedir recuperacao de password',
            handler: () => {
              window.location.href = 'https://gymspot.pt/password/reset';
            }
          }
        ]
      });

      await alert.present();
    } finally {
      this.isSubmitting = false;
    }
  }

  async updateUser() {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    await this.flushFocusedInput();

    try {
      if (this.password) {
        this.user.password = this.password;
        this.user.password_confirmation = this.password_confirmation;
      }

      const data = {
        access_token: this.access_token,
        user: this.user,
      };

      const resp = await firstValueFrom(this.api.updateUser(data));
      this.user = resp;

      const alert = await this.alertController.create({
        header: 'Atualizado com sucesso!',
        message: 'Pode continuar',
        backdropDismiss: false,
        buttons: [
          {
            text: 'Continuar',
            handler: () => {
              this.inicialize();
              this.password = null;
              this.password_confirmation = null;
            }
          }
        ]
      });

      await alert.present();
    } catch (err: any) {
      console.log(err);

      const alert = await this.alertController.create({
        header: 'Erro de validacao',
        message: this.buildValidationMessage(err, 'Nao foi possivel atualizar os dados.'),
        buttons: [
          {
            text: 'Tentar novamente',
            role: 'cancel'
          }
        ]
      });

      await alert.present();
    } finally {
      this.isSubmitting = false;
    }
  }

  async logout(showLoading = true) {
    let loading: HTMLIonLoadingElement | null = null;

    if (showLoading) {
      loading = await this.loadingController.create();
      await loading.present();
    }

    await this.preferences.removeName('access_token');
    this.access_token = null;

    if (loading) {
      await loading.dismiss();
    }
  }

  async updateClient() {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    await this.flushFocusedInput();

    try {
      const data = {
        access_token: this.access_token,
        client: this.client
      };

      await firstValueFrom(this.api.updateClient(data));

      const alert = await this.alertController.create({
        header: 'Atualizado com sucesso',
        message: 'Pode continuar',
        backdropDismiss: false,
        buttons: [
          {
            text: 'Continuar',
            handler: () => {
              this.inicialize();
            }
          }
        ]
      });

      await alert.present();
    } catch (err: any) {
      console.log(err);

      const alert = await this.alertController.create({
        header: 'Erro de validacao',
        message: this.buildValidationMessage(err, 'Nao foi possivel atualizar os dados de faturacao.'),
        buttons: [
          {
            text: 'Tentar novamente',
            role: 'cancel'
          }
        ]
      });

      await alert.present();
    } finally {
      this.isSubmitting = false;
    }
  }

  goPersonalTrainer() {
    this.router.navigateByUrl('personal-trainer-area');
  }

  delAccount() {
    this.alertController.create({
      message: 'Tem a certeza? O processo e irreversivel.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Sim. Quero prosseguir',
          handler: () => {
            const data = {
              access_token: this.access_token
            };

            this.api.deleteAccount(data).subscribe(() => {
              this.alertController.create({
                message: 'Obrigado. Vamos proceder a eliminacao da conta e de todo o seu historico.',
              }).then((alert) => {
                alert.present();
              });
            });
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    }).then((alert) => {
      alert.present();
    });
  }
}
