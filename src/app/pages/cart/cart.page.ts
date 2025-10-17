import { Component } from '@angular/core';
import { LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { FormsModule } from '@angular/forms';
import { IonicSafeString } from '@ionic/core';
import {
  IonContent,
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
  IonInput,
  IonNote,
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { code } from 'ionicons/icons';

registerLocaleData(localePt);

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [
    IonContent,
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
    IonInput,
    IonNote,
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt' }]
})
export class CartPage {

  selectedSlots: any = [];
  access_token: any;
  totalAmount: number = 0;
  buttons: any = [];
  myPacks: any = [];
  budget: number = 0;
  promoCode: string = '';
  validPromoCode: boolean = false;
  helperText: string = '';
  promoCodeDescription: string = '';

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
                if (!slot.spot.sale) {
                  return total + parseFloat(slot.spot.price);
                } else {
                  return total + parseFloat(slot.spot.sale);
                }
              }, 0);
              let data = {
                access_token: this.access_token
              }
              this.api.myPacks(data).subscribe((resp: any) => {
                this.myPacks = resp;
                this.budget = this.myPacks.reduce((total: number, pack: any) => total + pack.available, 0);
                this.addButtons(this.budget).then(() => {
                  loading.dismiss();
                });
              });
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

  async addButtons(budget: any) {
    this.buttons = [
      {
        text: 'Saldo de pack',
        handler: () => {
          if (budget > 0 && this.selectedSlots.length <= budget) {
            let data = {
              access_token: this.access_token,
              cart: JSON.stringify(this.selectedSlots),
            }
            this.loadingController.create().then((loading) => {
              loading.present();
              this.api.payByBudget(data).subscribe((resp: any) => {
                loading.dismiss();
                this.alertController.create({
                  header: 'Pagamento com Saldo',
                  subHeader: 'O seu saldo será descontado',
                  message: 'Ao prosseguir concordo com os termos e condições expressos em gymspot.pt.',
                  backdropDismiss: false,
                  buttons: [
                    {
                      text: 'Cancelar',
                      role: 'cancel'
                    },
                    {
                      text: 'Proseguir',
                      handler: () => {
                        this.alertController.create({
                          header: 'Pagamento concluido',
                          subHeader: 'O seu saldo foi descontado',
                          message: 'Será encaminhado para a área das suas reservas para receber o código de acesso ao spot.',
                          backdropDismiss: false,
                          buttons: [
                            {
                              text: 'Prosseguir',
                              handler: async () => {
                                await this.preferences.removeName('selected_slots');
                                setTimeout(() => {
                                  this.router.navigateByUrl('/tabs/tab2');
                                }, 500);
                              }
                            }
                          ]
                        }).then((alert) => {
                          alert.present();
                        });
                      }
                    }
                  ]
                }).then((alert) => {
                  alert.present();
                });
              });
            });
          } else {
            this.alertController.create({
              header: 'Saldo de pack',
              subHeader: 'Saldo insuficiente!',
              message: 'Deseja adquirir um pack para garantir mais treinos por um valor reduzido?',
              buttons: [
                {
                  text: 'Não',
                  role: 'cancel'
                },
                {
                  text: 'Sim',
                  handler: () => {
                    this.router.navigateByUrl('tabs/tab5');
                  }
                }
              ]
            }).then((alert) => {
              alert.present();
            });
          }
        }
      },
      {
        text: 'MBWAY',
        handler: async () => {
          const alert = await this.alertController.create({
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
                handler: async (inputs) => {
                  const loading = await this.loadingController.create();
                  await loading.present();
                  const data = {
                    access_token: this.access_token,
                    cart: JSON.stringify(this.selectedSlots),
                    amount: this.totalAmount,
                    celphone: inputs.celphone,
                    promoCode: {
                      code: this.promoCode,
                      validPromoCode: this.validPromoCode
                    }
                  };
                  this.api.payByMbway(data).subscribe(async (resp: any) => {
                    await loading.dismiss();
                    const successAlert = await this.alertController.create({
                      header: 'Pagamento Mbway',
                      subHeader: 'Abra a aplicação MBWAY e autorize o pagamento.',
                      message: 'Depois, volte à aplicação GymSpot e aceda ao separador RESERVAS para encontrar o seu código de acesso ao SPOT.',
                      backdropDismiss: false,
                      buttons: [
                        {
                          text: 'Ok',
                          handler: async () => {
                            await this.preferences.removeName('selected_slots');
                            setTimeout(() => {
                              this.router.navigateByUrl('/tabs/tab2');
                            }, 500);
                          }
                        }
                      ]
                    });
                    await successAlert.present();
                  }, async (err) => {
                    await loading.dismiss();
                    const errorAlert = await this.alertController.create({
                      header: 'Erro no meio de pagamento',
                      message: 'Pode tentar novamente o checkout.',
                      backdropDismiss: false,
                      buttons: [
                        {
                          text: 'Tentar novamente',
                          role: 'cancel'
                        }
                      ]
                    });
                    await errorAlert.present();
                  });
                }
              },
            ]
          });
          await alert.present();
        }
      },
      {
        text: 'Referência multibanco',
        handler: async () => {
          const loading = await this.loadingController.create();
          await loading.present();
          const data = {
            access_token: this.access_token,
            cart: JSON.stringify(this.selectedSlots),
            amount: this.totalAmount,
            promoCode: {
              code: this.promoCode,
              validPromoCode: this.validPromoCode
            }
          };
          this.api.payByMultibanco(data).subscribe(async (resp: any) => {
            await loading.dismiss();
            const alert = await this.alertController.create({
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
                  handler: async () => {
                    await this.preferences.removeName('selected_slots');
                    setTimeout(() => {
                      this.router.navigateByUrl('/tabs/tab2');
                    }, 500);
                  }
                }
              ]
            });
            await alert.present();
          }, async (err) => {
            await loading.dismiss();
            console.log(err);
            const errorAlert = await this.alertController.create({
              header: 'Erro no meio de pagamento',
              message: 'Pode tentar novamente o checkout.',
              backdropDismiss: false,
              buttons: [
                {
                  text: 'Tentar novamente',
                  role: 'cancel'
                }
              ]
            });
            await errorAlert.present();
          });
        }
      },

      {
        text: 'Cancelar',
        role: 'cancel'
      }
    ];
  }

  pay() {
    this.actionSheetController.create({
      header: 'Escolher método de pagamento',
      backdropDismiss: false,
      buttons: this.buttons
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

  validatePromoCode() {
    this.loadingController.create().then((loading) => {
      loading.present();
      let data = {
        access_token: this.access_token,
        code: this.promoCode
      }
      this.api.validatePromoCode(data).subscribe((resp: any) => {
        this.helperText = resp.message;
        this.promoCodeDescription = resp.description;
        if (resp.success == true && resp.data) {
          this.applyPromoCode(this.totalAmount, resp.data.type, resp.data.value, resp.data.min_value, resp.data.promo);
        }
        loading.dismiss();
      }, (err) => {
        loading.dismiss();
        console.log(err);
      });
    });
  }

  applyPromoCode(totalAmount: any, type: any, value: any, minValue: any, promo: any ) {

    if (this.validPromoCode == false && totalAmount >= minValue && promo == 'slots') {

      let discount = 0;

      if (type === 'percent') {
        discount = totalAmount * value / 100;
      } else {
        discount = value;
      }

      // Garante que o desconto não é maior que o total
      if (discount > totalAmount) {
        discount = totalAmount;
      }

      this.totalAmount = totalAmount - discount;

      this.validPromoCode = true;
    }
  }

}
