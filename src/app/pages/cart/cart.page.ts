// src/app/pages/cart/cart.page.ts
import { Component } from '@angular/core';
import { LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { FormsModule } from '@angular/forms';
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

// ✅ novos imports para check de versão só no Cart
import { Platform } from '@ionic/angular';
import { VersionCheckService } from 'src/app/services/version-check.service';
import { App } from '@capacitor/app';
import { firstValueFrom } from 'rxjs';

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

  selectedSlots: any[] = [];
  access_token: any;
  totalAmount = 0;
  buttons: any[] = [];
  myPacks: any[] = [];
  budget = 0;
  promoCode = '';
  validPromoCode = false;
  helperText = '';
  promoCodeDescription = '';

  constructor(
    private preferences: PreferencesService,
    private actionSheetController: ActionSheetController,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private api: ApiService,
    // ✅ injetados para o check de versão local (apenas no Cart)
    private platform: Platform,
    private versionCheck: VersionCheckService
  ) { }

  // corre sempre que a página vai entrar
  async ionViewWillEnter(): Promise<void> {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      // 1) Check de versão — APENAS no Cart
      const installed = await this.versionCheck.getInstalledVersion();
      const remote = await this.versionCheck.fetchRemote();

      if (remote && this.versionCheck.mustForceUpdate(installed, remote)) {
        await loading.dismiss();
        await this.showForceUpdateAlert(remote.message, remote);
        return; // bloqueia o resto do fluxo
      }

      // 2) Carregar access_token e slots (sem setTimeouts)
      const tokenPref: any = await this.preferences.checkName('access_token');
      this.access_token = tokenPref?.value;

      const slotsPref: any = await this.preferences.checkName('selected_slots');
      this.selectedSlots = JSON.parse(slotsPref?.value || '[]');

      // 3) Total (respeita sale quando existir)
      this.totalAmount = this.selectedSlots.reduce((total: number, slot: any) => {
        const price = slot?.spot?.sale ?? slot?.spot?.price ?? 0;
        return total + parseFloat(price);
      }, 0);

      // 4) Buscar packs e preparar botões
      const data = { access_token: this.access_token };
      const resp3: any = await firstValueFrom(this.api.myPacks(data));
      this.myPacks = resp3 || [];
      this.budget = this.getVisibleBudget();
      await this.addButtons(this.budget);
    } finally {
      await loading.dismiss();
    }
  }

  // ---------- Check de versão (só aqui) ----------
  private updateAlertOpen = false;

  private async dismissAnyOverlay() {
    // Fecha qualquer overlay que possa estar aberto (evita “fila” que bloqueia cliques)
    try {
      const topLoading = await this.loadingController.getTop();
      if (topLoading) await topLoading.dismiss();
    } catch { }
    try {
      const topAlert = await this.alertController.getTop();
      if (topAlert) await topAlert.dismiss();
    } catch { }
    // Se usares ActionSheetController noutros fluxos, faz o mesmo:
    try {
      const topAction = await (this.actionSheetController as any).getTop?.();
      if (topAction) await topAction.dismiss();
    } catch { }
  }

  private async showForceUpdateAlert(message?: string, remote?: any) {
    if (this.updateAlertOpen) return;
    this.updateAlertOpen = true;

    await this.dismissAnyOverlay();

    const alert = await this.alertController.create({
      header: 'Atualização necessária',
      message: message || 'Há uma nova versão do Gym Spot. Instala para continuar.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Atualizar agora',
          handler: async () => {
            const ok = this.platform.is('android')
              ? await this.versionCheck.tryAndroidImmediateUpdate()
              : false;
            if (!ok) {
              await this.versionCheck.openStore(this.versionCheck.getStoreUrl(remote));
            }
          }
        },
        {
          text: this.platform.is('android') ? 'Sair' : 'Fechar',
          role: 'destructive',
          handler: () => {
            if (this.platform.is('android')) App.exitApp();
          }
        }
      ]
    });

    alert.onDidDismiss().then(() => (this.updateAlertOpen = false));
    await alert.present();
  }


  // ---------------------------
  // Helpers mínimos (só strings YYYY-MM-DD)
  // ---------------------------

  // "2025-11-13 02:30:00" -> "2025-11-13"
  private slotYmd(slot: any): string | null {
    const ts = slot?.timestamp;
    if (!ts || typeof ts !== 'string') return null;
    const ymd = ts.split(' ')[0];
    // sanity-check rápido
    return /^\d{4}-\d{2}-\d{2}$/.test(ymd) ? ymd : null;
  }

  // "2025-11-16" -> "2025-11-16"
  private packExpiryYmd(limit_date: any): string | null {
    if (!limit_date || typeof limit_date !== 'string') return null;
    const ymd = limit_date.trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(ymd) ? ymd : null;
  }

  private todayYmd(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  // packs utilizáveis: available > 0 e limit_date válido
  private getUsablePacks(): any[] {
    return (this.myPacks || []).filter(p => {
      const a = Number(p?.available ?? 0);
      const exp = this.packExpiryYmd(p?.limit_date);
      return a > 0 && !!exp;
    });
  }

  // orçamento visível hoje (apenas packs que não expiraram hoje)
  private getVisibleBudget(): number {
    const today = this.todayYmd();
    return this.getUsablePacks().reduce((sum, p) => {
      const exp = this.packExpiryYmd(p.limit_date)!;
      return sum + (exp >= today ? Number(p.available) : 0);
    }, 0);
  }

  // Validação/Alocação usando APENAS strings "YYYY-MM-DD"
  private canCoverSlotsWithPacks(slots: any[], packs: any[]): {
    ok: boolean;
    reason?: 'missing_slot_dates' | 'no_valid_pack_for_some_slot';
    detail?: { latestSlot?: string; latestValid?: string };
  } {
    // 1) datas dos slots
    const slotDays: string[] = [];
    for (const s of slots) {
      const ymd = this.slotYmd(s);
      if (!ymd) return { ok: false, reason: 'missing_slot_dates' };
      slotDays.push(ymd);
    }
    // ordenar cronologicamente (lex em YYYY-MM-DD funciona)
    slotDays.sort();

    // 2) expandir packs em tokens (um por sessão disponível)
    const tokens: string[] = [];
    for (const p of packs) {
      const exp = this.packExpiryYmd(p.limit_date)!;
      const available = Number(p.available);
      for (let i = 0; i < available; i++) tokens.push(exp);
    }
    // ordenar por validade (mais cedo primeiro)
    tokens.sort();

    if (tokens.length < slotDays.length) {
      return { ok: false, reason: 'no_valid_pack_for_some_slot' };
    }

    // 3) alocação gulosa: para cada slot, precisa de token com expiry >= slotDay
    for (const sDay of slotDays) {
      const idx = tokens.findIndex(exp => exp >= sDay);
      if (idx === -1) {
        const latestSlot = slotDays[slotDays.length - 1];
        const latestValid = tokens.length ? tokens[tokens.length - 1] : undefined;
        return {
          ok: false,
          reason: 'no_valid_pack_for_some_slot',
          detail: { latestSlot, latestValid }
        };
      }
      tokens.splice(idx, 1); // consome
    }

    return { ok: true };
  }

  // ---------------------------
  // Ciclo de vida (restante)
  // ---------------------------

  // Mantive a tua assinatura porque é usada noutros pontos
  async inicialize() {
    // Esta função ficou “vazia” porque o trabalho foi para o ionViewWillEnter,
    // mas mantemos para compatibilidade se for chamada noutros locais.
  }

  // ---------------------------
  // UI / Ações
  // ---------------------------

  removeFromCart(index: number) {
    this.selectedSlots.splice(index, 1);
    this.preferences.setName('selected_slots', JSON.stringify(this.selectedSlots));
    this.updateTotal();
  }

  deleteCart() {
    this.actionSheetController.create({
      header: 'Eliminar carrinho',
      buttons: [
        { text: 'cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.preferences.removeName('selected_slots').then(() => {
              this.router.navigateByUrl('/tabs/tab1');
            });
          }
        }
      ]
    }).then((action) => action.present());
  }

  async addButtons(_budget: number) {
    this.buttons = [
      {
        text: 'Saldo de pack',
        handler: () => {
          const packs = this.getUsablePacks();

          if (packs.length === 0) {
            this.alertController.create({
              header: 'Saldo de pack',
              subHeader: 'Sem saldo válido',
              message: 'Não tem packs com saldo disponível dentro do prazo de validade. Deseja adquirir um pack?',
              buttons: [
                { text: 'Agora não', role: 'cancel' },
                { text: 'Comprar pack', handler: () => this.router.navigateByUrl('tabs/tab5') }
              ]
            }).then(a => a.present());
            return;
          }

          const validation = this.canCoverSlotsWithPacks(this.selectedSlots, packs);

          if (!validation.ok) {
            const msg =
              validation.reason === 'missing_slot_dates'
                ? 'Não foi possível validar as datas das reservas (timestamp em falta).'
                : validation.detail?.latestValid
                  ? `Pelo menos uma reserva (${validation.detail.latestSlot}) é posterior à validade máxima dos seus packs (${validation.detail.latestValid}).`
                  : 'Não existe saldo de pack válido para pelo menos uma das datas das suas reservas.';

            this.alertController.create({
              header: 'Saldo de pack',
              subHeader: 'Não é possível usar saldo para estas datas',
              message: `${msg} Deseja adquirir um pack?`,
              buttons: [
                { text: 'Agora não', role: 'cancel' },
                { text: 'Comprar pack', handler: () => this.router.navigateByUrl('tabs/tab5') }
              ]
            }).then(a => a.present());
            return;
          }

          // ✅ tudo ok → checkout por saldo
          const data = {
            access_token: this.access_token,
            cart: JSON.stringify(this.selectedSlots),
          };

          this.loadingController.create().then((loading) => {
            loading.present();
            this.api.payByBudget(data).subscribe(() => {
              loading.dismiss();
              this.alertController.create({
                header: 'Pagamento com Saldo',
                subHeader: 'O seu saldo foi descontado',
                message: 'Será encaminhado para a área das suas reservas para obter o código de acesso ao spot.',
                backdropDismiss: false,
                buttons: [
                  {
                    text: 'Prosseguir',
                    handler: async () => {
                      await this.preferences.removeName('selected_slots');
                      setTimeout(() => this.router.navigateByUrl('/tabs/tab2'), 500);
                    }
                  }
                ]
              }).then(alert => alert.present());
            }, async () => {
              loading.dismiss();
              await this.alertController.create({
                header: 'Erro no meio de pagamento',
                message: 'Pode tentar novamente o checkout.',
                backdropDismiss: false,
                buttons: [{ text: 'Tentar novamente', role: 'cancel' }]
              }).then(a => a.present());
            });
          });
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
            inputs: [{ name: 'celphone', type: 'number', placeholder: '#########', label: 'Telemóvel' }],
            buttons: [
              { text: 'Cancelar', role: 'cancel' },
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
                    promoCode: { code: this.promoCode, validPromoCode: this.validPromoCode }
                  };
                  this.api.payByMbway(data).subscribe(async () => {
                    await loading.dismiss();
                    const successAlert = await this.alertController.create({
                      header: 'Pagamento Mbway',
                      subHeader: 'Abra a aplicação MBWAY e autorize o pagamento.',
                      message: 'Depois, volte à app e aceda ao separador RESERVAS para encontrar o seu código.',
                      backdropDismiss: false,
                      buttons: [{
                        text: 'Ok',
                        handler: async () => {
                          await this.preferences.removeName('selected_slots');
                          setTimeout(() => this.router.navigateByUrl('/tabs/tab2'), 500);
                        }
                      }]
                    });
                    await successAlert.present();
                  }, async () => {
                    await loading.dismiss();
                    const errorAlert = await this.alertController.create({
                      header: 'Erro no meio de pagamento',
                      message: 'Pode tentar novamente o checkout.',
                      backdropDismiss: false,
                      buttons: [{ text: 'Tentar novamente', role: 'cancel' }]
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
            promoCode: { code: this.promoCode, validPromoCode: this.validPromoCode }
          };
          this.api.payByMultibanco(data).subscribe(async (resp: any) => {
            await loading.dismiss();
            const alert = await this.alertController.create({
              header: 'Pagamento multibanco',
              subHeader: 'Referência para pagamento',
              message: 'A referência foi enviada para o seu email. O acesso ao spot ficará disponível em RESERVAS assim que o pagamento for realizado.',
              backdropDismiss: false,
              inputs: [
                { label: 'Entidade', value: resp.Entity, disabled: true },
                { label: 'Referência', value: resp.Reference, disabled: true },
                { label: 'Montante', value: `${parseFloat(resp.Amount).toFixed(2)} €`, disabled: true }
              ],
              buttons: [{
                text: 'Concluir',
                handler: async () => {
                  await this.preferences.removeName('selected_slots');
                  setTimeout(() => this.router.navigateByUrl('/tabs/tab2'), 500);
                }
              }]
            });
            await alert.present();
          }, async (err) => {
            await loading.dismiss();
            console.log(err);
            const errorAlert = await this.alertController.create({
              header: 'Erro no meio de pagamento',
              message: 'Pode tentar novamente o checkout.',
              backdropDismiss: false,
              buttons: [{ text: 'Tentar novamente', role: 'cancel' }]
            });
            await errorAlert.present();
          });
        }
      },
      { text: 'Cancelar', role: 'cancel' }
    ];
  }

  pay() {
    this.actionSheetController.create({
      header: 'Escolher método de pagamento',
      backdropDismiss: false,
      buttons: this.buttons
    }).then((action) => action.present());
  }

  updateTotal() {
    this.totalAmount = this.selectedSlots.reduce((total: number, slot: any) => {
      const price = slot?.spot?.sale ?? slot?.spot?.price ?? 0;
      return total + parseFloat(price);
    }, 0);
  }

  goLogin() {
    this.router.navigateByUrl('tabs/tab3');
  }

  validatePromoCode() {
    this.loadingController.create().then((loading) => {
      loading.present();
      const data = { access_token: this.access_token, code: this.promoCode, value: this.totalAmount };
      this.api.validatePromoCode(data).subscribe((resp: any) => {
        this.helperText = resp.message;
        this.promoCodeDescription = resp.description;
        if (resp.success === true && resp.data) {
          this.applyPromoCode(this.totalAmount, resp.data.type, resp.data.value, resp.data.min_value, resp.data.promo);
        }
        loading.dismiss();
      }, () => loading.dismiss());
    });
  }

  applyPromoCode(totalAmount: any, type: any, value: any, minValue: any, promo: any) {
    if (this.validPromoCode === false && totalAmount >= minValue && promo === 'slots') {
      let discount = type === 'percent' ? (totalAmount * value / 100) : value;
      if (discount > totalAmount) discount = totalAmount;
      this.totalAmount = totalAmount - discount;
      this.validPromoCode = true;
    }
  }
}
