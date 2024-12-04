import { Component } from '@angular/core';
import { LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { FormsModule } from '@angular/forms';
import { IonicSafeString } from '@ionic/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItemSliding,
  IonItem,
  IonLabel,
  IonItemOptions,
  IonItemOption,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  ActionSheetController,
  IonFooter,
  LoadingController,
  AlertController,
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

registerLocaleData(localePt);

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonList,
    IonItemSliding,
    IonItem,
    IonLabel,
    IonItemOptions,
    IonItemOption,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonFooter,
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt' }]
})
export class CartPage {

  selectedSlots: any = [];
  access_token: any;
  totalAmount: number = 0;  // Variável para armazenar o total

  constructor(
    private preferences: PreferencesService,
    private actionSheetController: ActionSheetController,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private api: ApiService
  ) { }

  ionViewWillEnter() {
    this.inicialize();
  }

  inicialize() {
    this.loadingController.create().then((loading) => {
      loading.present();
      this.preferences.checkName('access_token').then((resp: any) => {
        setTimeout(() => {
          this.access_token = resp.value;
          this.preferences.checkName('selected_slots').then((resp: any) => {
            setTimeout(() => {
              this.selectedSlots = JSON.parse(resp.value) || [];
              // Calcular o total
              this.totalAmount = this.selectedSlots.reduce((total: number, slot: any) => {
                if(!slot.spot.sale){
                return total + parseFloat(slot.spot.price);
                } else {
                  return total + parseFloat(slot.spot.sale);
                }
              }, 0);
              loading.dismiss();
            }, 500);
          });
        }, 500);
      });
    });
  }

  removeFromCart(index: number) {
    this.selectedSlots.splice(index, 1);
    this.preferences.setName('selected_slots', JSON.stringify(this.selectedSlots));
    this.updateTotal();  // Atualizar o total ao remover item
  }

  deleteCart() {
    this.actionSheetController.create({
      header: 'Eliminar carrinho',
      buttons: [
        {
          text: 'cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.preferences.removeName('selected_slots').then(() => {
              this.router.navigateByUrl('/tabs/tab1');
            });
          }
        }
      ]
    }).then((action) => {
      action.present();
    });
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
                  text: 'Continuar',
                  handler: (inputs) => {
                    this.loadingController.create({
                      message: 'Aguarde enquanto enviamos o pedido para o seu telemóvel. Assim que receber pode dar seguimento ao pagamento.'
                    }).then((loading) => {
                      loading.present();
                      let data = {
                        access_token: this.access_token,
                        cart: JSON.stringify(this.selectedSlots),
                        amount: this.totalAmount,
                        celphone: inputs.celphone
                      }
                      this.api.payByMbway(data).subscribe((resp: any) => {
                        if (resp.Status == 100 || resp.Status == 122 || resp.Status == 999) {
                          loading.dismiss();
                          this.alertController.create({
                            header: 'Pagamento não concluido',
                            message: 'Tente novamente',
                            backdropDismiss: false,
                            buttons: [
                              {
                                text: 'Tentar novamente',
                                handler: () => {
                                  this.pay();
                                }
                              },
                              {
                                text: 'cancelar',
                                role: 'cancel'
                              }
                            ]
                          }).then((alert) => {
                            alert.present();
                          })
                        } else {
                          let data = {
                            access_token: this.access_token,
                            requestId: resp.RequestId
                          }
                          let i = setInterval(() => {
                            this.api.checkMbwayStatus(data).subscribe((resp: any) => {
                              if (resp.Status == '020') {
                                //Declined by user
                                clearInterval(i);
                                loading.dismiss();
                                this.alertController.create({
                                  header: 'Cancelado',
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
                              } else if (resp.Status == '000') {
                                clearInterval(i);
                                loading.dismiss();
                                this.alertController.create({
                                  header: 'Pago com sucesso',
                                  message: 'Pode consultar os seus códigos de acesso no separador RESERVAS.',
                                  backdropDismiss: false,
                                  buttons: [
                                    {
                                      text: 'Ir para as reservas',
                                      handler: () => {
                                        this.preferences.removeName('selected_slots').then(() => {
                                          setTimeout(() => {
                                            this.router.navigateByUrl('/tabs/tab2');
                                          }, 500);
                                        });
                                      }
                                    }
                                  ]
                                }).then((alert) => {
                                  alert.present();
                                });
                              }
                            }, (err) => {
                              loading.dismiss();
                              clearInterval(i);
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
                          }, 5000);
                        }
                      }, (err) => {
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
                cart: JSON.stringify(this.selectedSlots),
                amount: this.totalAmount,
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
                            this.router.navigateByUrl('/tabs/tab2');
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

  updateTotal() {
    this.totalAmount = this.selectedSlots.reduce((total: number, slot: any) => {
      return total + parseFloat(slot.spot.price);
    }, 0);
  }

  goLogin() {
    this.router.navigateByUrl('tabs/tab3');
  }

}
