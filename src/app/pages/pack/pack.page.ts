import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  LoadingController,
  IonImg,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonFooter,
  IonToolbar,
  IonButton,
  AlertController,
  ActionSheetController,
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { ApiService } from 'src/app/services/api.service';
import { PreferencesService } from 'src/app/services/preferences.service';

@Component({
  selector: 'app-pack',
  templateUrl: './pack.page.html',
  styleUrls: ['./pack.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonImg,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonFooter,
    IonToolbar,
    IonButton,
  ]
})
export class PackPage {

  constructor(
    private api: ApiService,
    private loadingController: LoadingController,
    private route: ActivatedRoute,
    private preferences: PreferencesService,
    private router: Router,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController
  ) { }

  access_token: any;
  pack_id: any;
  pack: any;

  ionViewWillEnter() {
    this.loadingController.create().then((loading) => {
      loading.present();
      this.preferences.checkName('access_token').then((resp: any) => {
        this.access_token = resp.value;
      });
      this.pack_id = this.route.snapshot.params['pack_id'];
      this.api.pack(this.pack_id).subscribe((resp: any) => {
        loading.dismiss();
        this.pack = resp.data;
      }, (err) => {
        console.log(err);
        loading.dismiss();
      });
    });
  }

  purchasePack(pack_id: any) {
    console.log(pack_id);
  }
  goLogin() {
    this.router.navigateByUrl('tabs/tab3');
  }

  pay() {
    this.actionSheetController.create({
      header: 'Escolher método de pagamento',
      backdropDismiss: false,
      buttons: [
        {
          text: 'MBWAY',
          handler: () => {
            this.alertController.create({
              header: 'Pagamento por MBWAY',
              subHeader: 'Introduza o seu numero de telemóvel',
              message: 'Ao prosseguir concordo com os termos e condições expressos em gymspot.pt.',
              backdropDismiss: false,
              inputs: [
                {
                  name: 'celphone',
                  type: 'number',
                  placeholder: '#########',
                  label: 'Telemovel'
                },
              ],
              buttons: [
                {
                  text: 'Cancelar',
                  role: 'cancel'
                },
                {
                  text: 'Continuar',
                  handler: (inputs) => {
                    this.loadingController.create().then((loading) => {
                      loading.present();
                      let data = {
                        access_token: this.access_token,
                        cart: JSON.stringify(this.pack),
                        amount: this.pack.price,
                        celphone: inputs.celphone
                      }
                      console.log(data);
                      this.api.payByMbway(data).subscribe((resp: any) => {
                        loading.dismiss();
                        this.alertController.create({
                          header: 'Pagamento Mbway',
                          subHeader: 'Abra a aplicação MBWAY e autorize o pagamento.',
                          message: 'Depois, volte à aplicação GymSpot e aceda ao separador PACKS e depois MEUS PACKS.',
                          backdropDismiss: false,
                          buttons: [
                            {
                              text: 'Ok',
                              handler: () => {
                                this.router.navigateByUrl('/tabs/tab5/my');
                              }
                            }
                          ]
                        }).then((alert) => {
                          alert.present();
                        });
                      }, (err) => {
                        loading.dismiss();
                        this.alertController.create({
                          header: 'Erro no meio de pagamento',
                          message: 'Pode tentar novamente o checkout.',
                          backdropDismiss: false,
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
                },
              ]
            }).then((alert) => {
              alert.present();
            });
          }
        },
        {
          text: 'Referência multibanco',
          handler: () => {
            this.loadingController.create().then((loading) => {
              loading.present();
              let data = {
                access_token: this.access_token,
                cart: JSON.stringify(this.pack),
                amount: this.pack.price,
              }
              this.api.payByMultibanco(data).subscribe((resp: any) => {
                loading.dismiss();
                this.alertController.create({
                  header: 'Pagamento multibanco',
                  subHeader: 'Referência para pagamento',
                  message: 'A referência foi enviada para o seu email. O acesso ao spot ficará disponível em RESERVAS assim que o pagamento for realizado.',
                  backdropDismiss: false,
                  inputs: [
                    {
                      label: 'Entidade',
                      value: resp.Entity,
                      disabled: true,
                    },
                    {
                      label: 'Referência',
                      value: resp.Reference,
                      disabled: true
                    },
                    {
                      label: 'Montante',
                      value: `${parseFloat(resp.Amount).toFixed(2)} €`,
                      disabled: true
                    }
                  ],
                  buttons: [
                    {
                      text: 'Concluir',
                      handler: () => {
                        this.preferences.removeName('selected_slots').then(() => {
                          setTimeout(() => {
                            this.router.navigateByUrl('/tabs/tab5/my');
                          }, 500);
                        });
                      }
                    }
                  ]
                }).then((alert) => {
                  alert.present();
                });
              }, (err) => {
                loading.dismiss();
                console.log(err);
                this.alertController.create({
                  header: 'Erro no meio de pagamento',
                  message: 'Pode tentar novamente o checkout.',
                  backdropDismiss: false,
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
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    }).then((action) => {
      action.present();
    });
  }

}
