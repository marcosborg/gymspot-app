import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonButton,
  AlertController,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { PreferencesService } from '../services/preferences.service';
import { Router } from '@angular/router';
import { CartButtonComponent } from '../components/cart-button/cart-button.component';

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
    CommonModule,
    FormsModule,
    IonSelect,
    IonSelectOption,
    CartButtonComponent,
  ],
})
export class Tab3Page implements OnInit {
  constructor(
    private api: ApiService,
    private loadingController: LoadingController,
    private preferences: PreferencesService,
    private alertController: AlertController,
    private router: Router
  ) { }

  ngOnInit() {
    this.inicialize();
  }

  inicialize() {
    this.loadingController.create().then((loading) => {
      loading.present();
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
      this.preferences.checkName('access_token').then((resp: any) => {
        if (resp.value) {
          this.access_token = resp.value;
          let data = {
            access_token: this.access_token
          }
          this.api.user(data).subscribe((resp: any) => {
            this.user = resp;
            if (this.user) {
              if (this.user.client) {
                this.client = this.user.client;
              }
              this.api.countries(data).subscribe((resp: any) => {
                loading.dismiss();
                this.countries = resp.data;
              }, (err) => {
                loading.dismiss();
                console.log(err);
              });
            } else {
              loading.dismiss();
              this.logout()
            }
          }, (err) => {
            loading.dismiss();
            console.log(err);
          });
        } else {
          loading.dismiss();
          this.logout()
        }
      });
    });
  }

  access_token: any;
  create: boolean = false;
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
  countries: any = [];

  login() {
    this.loadingController.create().then((loading) => {
      loading.present();
      this.api.login(this.user).subscribe((resp: any) => {
        this.access_token = resp.access_token;
        this.preferences.setName('access_token', this.access_token).then(() => {
          loading.dismiss();
          this.alertController.create({
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
          }).then((alert) => {
            alert.present();
          });
        });
      }, (err: any) => {
        loading.dismiss();
        let errors = err.error.errors;
        let errorMessages = '';
        for (const field in errors) {
          if (errors.hasOwnProperty(field)) {
            errors[field].forEach((message: string) => {
              errorMessages += `${message}. `;
            });
          }
        }
        this.alertController.create({
          header: 'Erro de validação',
          message: errorMessages,
          buttons: [
            {
              text: 'Tentar novamente',
              role: 'cancel'
            },
            {
              text: 'Pedir recuperação de password',
              handler: () => {
                window.location.href = "https://gymspot.pt/password/reset";
              }
            }
          ]
        }).then((alert) => {
          alert.present();
        });
      });
    });
  }

  register() {
    this.loadingController.create().then((loading) => {
      loading.present();
      this.api.register(this.user).subscribe((resp: any) => {
        loading.dismiss();
        this.alertController.create({
          header: 'Verificação de conta',
          message: 'Consulte o seu email para concluir a verificação do seu registo',
          backdropDismiss: false,
          buttons: [
            {
              text: 'Já verifiquei',
              handler: () => {
                this.create = false;
              }
            },
          ]
        }).then((alert) => {
          alert.present();
        });
      }, (err) => {
        console.log(err);
        loading.dismiss();
        let errors = err.error.errors;
        let errorMessages = '';
        for (const field in errors) {
          if (errors.hasOwnProperty(field)) {
            errors[field].forEach((message: string) => {
              errorMessages += `${message}. `;
            });
          }
        }
        this.alertController.create({
          header: 'Erro de validação',
          message: errorMessages,
          buttons: [
            {
              text: 'Tentar novamente',
              role: 'cancel'
            },
            {
              text: 'Pedir recuperação de password',
              handler: () => {
                window.location.href = "https://gymspot.pt/password/reset";
              }
            }
          ]
        }).then((alert) => {
          alert.present();
        });
      });
    });
  }

  updateUser() {
    this.loadingController.create().then((loading) => {
      loading.present();
      if (this.password) {
        this.user.password = this.password;
        this.user.password_confirmation = this.password_confirmation
      }
      let data = {
        access_token: this.access_token,
        user: this.user,
      }
      this.api.updateUser(data).subscribe((resp) => {
        loading.dismiss();
        this.user = resp;
        this.alertController.create({
          header: 'Atualizado com sucesso!',
          message: 'pode continuar',
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
        }).then((alert) => {
          alert.present();
        });
      }, (err) => {
        console.log(err);
        loading.dismiss();
        let errors = err.error.errors;
        let errorMessages = '';
        for (const field in errors) {
          if (errors.hasOwnProperty(field)) {
            errors[field].forEach((message: string) => {
              errorMessages += `${message}. `;
            });
          }
        }
        this.alertController.create({
          header: 'Erro de validação',
          message: errorMessages,
          buttons: [
            {
              text: 'Tentar novamente',
              role: 'cancel'
            }
          ]
        }).then((alert) => {
          alert.present();
        });
      });
    });
  }

  logout() {
    this.loadingController.create().then((loading) => {
      loading.present();
      this.preferences.removeName('access_token').then(() => {
        this.access_token = null;
        loading.dismiss();
      });
    });
  }

  updateClient() {
    this.loadingController.create().then((loading) => {
      loading.present();
      let data = {
        access_token: this.access_token,
        client: this.client
      }
      this.api.updateClient(data).subscribe((resp: any) => {
        loading.dismiss();
        this.alertController.create({
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
        }).then((alert) => {
          alert.present();
        });
      });
    });
  }

  goPersonalTrainer() {
    this.router.navigateByUrl('personal-trainer-area');
  }

  delAccount() {
    this.alertController.create({
      message: 'Tem a certeza? O processo é irreversível.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Sim. Quero prosseguir',
          handler: () => {
            let data = {
              access_token: this.access_token
            }
            this.api.deleteAccount(data).subscribe(() => {
              this.alertController.create({
                message: 'Obrigado. Vamos proceder à eliminação da conta e de todo o seu histórico.',
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
