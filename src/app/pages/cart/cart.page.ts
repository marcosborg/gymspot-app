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
  validatingAvailability = false;

  constructor(
    private preferences: PreferencesService,
    private actionSheetController: ActionSheetController,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private api: ApiService,
    private platform: Platform,
    private versionCheck: VersionCheckService
  ) { }

  async ionViewWillEnter(): Promise<void> {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      const installed = await this.versionCheck.getInstalledVersion();
      const remote = await this.versionCheck.fetchRemote();

      if (remote && this.versionCheck.mustForceUpdate(installed, remote)) {
        await loading.dismiss();
        await this.showForceUpdateAlert(remote.message, remote);
        return;
      }

      const tokenPref: any = await this.preferences.checkName('access_token');
      this.access_token = tokenPref?.value;

      const slotsPref: any = await this.preferences.checkName('selected_slots');
      this.selectedSlots = JSON.parse(slotsPref?.value || '[]');
      await this.purgeExpiredSlotsFromCart(true);

      this.updateTotal();

      const data = { access_token: this.access_token };
      const resp3: any = await firstValueFrom(this.api.myPacks(data));
      this.myPacks = resp3 || [];
      this.budget = this.getVisibleBudget();
      await this.addButtons(this.budget);
    } finally {
      await loading.dismiss();
    }
  }

  private updateAlertOpen = false;

  private async dismissAnyOverlay() {
    try {
      const topLoading = await this.loadingController.getTop();
      if (topLoading) await topLoading.dismiss();
    } catch { }
    try {
      const topAlert = await this.alertController.getTop();
      if (topAlert) await topAlert.dismiss();
    } catch { }
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

  private slotYmd(slot: any): string | null {
    const ts = slot?.timestamp;
    if (!ts || typeof ts !== 'string') return null;
    const ymd = ts.split(' ')[0];
    return /^\d{4}-\d{2}-\d{2}$/.test(ymd) ? ymd : null;
  }

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

  private getUsablePacks(): any[] {
    return (this.myPacks || []).filter(p => {
      const a = Number(p?.available ?? 0);
      const exp = this.packExpiryYmd(p?.limit_date);
      return a > 0 && !!exp;
    });
  }

  private getVisibleBudget(): number {
    const today = this.todayYmd();
    return this.getUsablePacks().reduce((sum, p) => {
      const exp = this.packExpiryYmd(p.limit_date)!;
      return sum + (exp >= today ? Number(p.available) : 0);
    }, 0);
  }

  private canCoverSlotsWithPacks(slots: any[], packs: any[]): {
    ok: boolean;
    reason?: 'missing_slot_dates' | 'no_valid_pack_for_some_slot';
    detail?: { latestSlot?: string; latestValid?: string };
  } {
    const slotDays: string[] = [];
    for (const s of slots) {
      const ymd = this.slotYmd(s);
      if (!ymd) return { ok: false, reason: 'missing_slot_dates' };
      slotDays.push(ymd);
    }
    slotDays.sort();

    const tokens: string[] = [];
    for (const p of packs) {
      const exp = this.packExpiryYmd(p.limit_date)!;
      const available = Number(p.available);
      for (let i = 0; i < available; i++) tokens.push(exp);
    }
    tokens.sort();

    if (tokens.length < slotDays.length) {
      return { ok: false, reason: 'no_valid_pack_for_some_slot' };
    }

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
      tokens.splice(idx, 1);
    }

    return { ok: true };
  }

  async inicialize() {
  }

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
            }, async (err) => {
              loading.dismiss();
              await this.handleCheckoutError(err);
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
                  }, async (err) => {
                    await loading.dismiss();
                    await this.handleCheckoutError(err);
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
            await this.handleCheckoutError(err);
          });
        }
      },
      { text: 'Cancelar', role: 'cancel' }
    ];
  }

  async pay() {
    const stillAvailable = await this.ensureCartSlotsStillAvailable();
    if (!stillAvailable) {
      return;
    }

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

  private isSameSelectedSlot(slotA: any, slotB: any): boolean {
    return slotA?.timestamp === slotB?.timestamp
      && slotA?.start === slotB?.start
      && slotA?.end === slotB?.end
      && slotA?.spot?.id === slotB?.spot_id;
  }

  private parseLocalDateTime(value: string): Date | null {
    if (!value || typeof value !== 'string') {
      return null;
    }

    const [datePart, timePart] = value.trim().split(' ');
    if (!datePart || !timePart) {
      return null;
    }

    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds = 0] = timePart.split(':').map(Number);

    if ([year, month, day, hours, minutes, seconds].some(Number.isNaN)) {
      return null;
    }

    return new Date(year, month - 1, day, hours, minutes, seconds);
  }

  private buildSlotEndDate(slot: any): Date | null {
    const startDate = this.parseLocalDateTime(slot?.timestamp);
    if (!startDate) {
      return null;
    }

    const end = slot?.end;
    if (!end || typeof end !== 'string') {
      const fallbackEnd = new Date(startDate.getTime());
      fallbackEnd.setMinutes(fallbackEnd.getMinutes() + 30);
      return fallbackEnd;
    }

    const [hours, minutes] = end.split(':').map(Number);
    if ([hours, minutes].some(Number.isNaN)) {
      return null;
    }

    return new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      hours,
      minutes,
      0,
      0
    );
  }

  private isSlotExpired(slot: any): boolean {
    const slotEnd = this.buildSlotEndDate(slot);
    if (!slotEnd) {
      return false;
    }

    return slotEnd.getTime() <= Date.now();
  }

  private async removeConflictingSlots(conflicts: any[]): Promise<void> {
    this.selectedSlots = this.selectedSlots.filter((selectedSlot) => !conflicts.some((conflict) =>
      this.isSameSelectedSlot(selectedSlot, conflict)
    ));

    await this.preferences.setName('selected_slots', JSON.stringify(this.selectedSlots));
    this.updateTotal();
    this.budget = this.getVisibleBudget();
    await this.addButtons(this.budget);
  }

  private async purgeExpiredSlotsFromCart(showAlert = false): Promise<boolean> {
    const expiredSlots = this.selectedSlots.filter((slot) => this.isSlotExpired(slot));
    if (expiredSlots.length === 0) {
      return false;
    }

    this.selectedSlots = this.selectedSlots.filter((slot) => !this.isSlotExpired(slot));
    await this.preferences.setName('selected_slots', JSON.stringify(this.selectedSlots));
    this.updateTotal();
    this.budget = this.getVisibleBudget();
    await this.addButtons(this.budget);

    if (showAlert) {
      await this.alertController.create({
        header: 'Slots expiradas',
        message: `Foram removidas do carrinho reservas cujo horário já terminou:<br><br>${this.formatConflictMessage(expiredSlots.map((slot) => ({
          spot_id: slot?.spot?.id,
          spot_name: slot?.spot?.name ?? null,
          timestamp: slot?.timestamp,
          start: slot?.start,
          end: slot?.end,
          reason: 'expired',
        })))}`,
        backdropDismiss: false,
        buttons: ['Ok']
      }).then((alert) => alert.present());
    }

    return true;
  }

  private formatConflictMessage(conflicts: any[]): string {
    return conflicts
      .map((conflict) => {
        const reason = conflict?.reason === 'expired'
          ? 'horário terminado'
          : 'ocupada';
        return `${conflict.spot_name ?? 'Spot'}: ${conflict.timestamp} (${conflict.start} - ${conflict.end}) - ${reason}`;
      })
      .join('<br>');
  }

  private async ensureCartSlotsStillAvailable(): Promise<boolean> {
    if (this.validatingAvailability) {
      return false;
    }

    const removedExpiredSlots = await this.purgeExpiredSlotsFromCart(true);
    if (removedExpiredSlots && this.selectedSlots.length === 0) {
      return false;
    }

    if (!this.access_token || this.selectedSlots.length === 0) {
      return this.selectedSlots.length > 0;
    }

    this.validatingAvailability = true;
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      await firstValueFrom(this.api.validateCartSlots({
        access_token: this.access_token,
        cart: JSON.stringify(this.selectedSlots),
      }));
      return true;
    } catch (err: any) {
      if (err?.status === 409) {
        const conflicts = err?.error?.conflicts ?? [];
        await this.removeConflictingSlots(conflicts);
        await this.alertController.create({
          header: 'Slots indisponíveis',
          message: conflicts.length > 0
            ? `Algumas reservas do carrinho já não estão disponíveis ou já passaram da hora e foram removidas:<br><br>${this.formatConflictMessage(conflicts)}`
            : 'Algumas reservas do carrinho já não estão disponíveis.',
          backdropDismiss: false,
          buttons: ['Ok']
        }).then((alert) => alert.present());
      } else if (err?.status === 422) {
        await this.alertController.create({
          header: 'Limite de reservas',
          message: err?.error?.message ?? 'O carrinho não cumpre as regras de reserva.',
          backdropDismiss: false,
          buttons: ['Ok']
        }).then((alert) => alert.present());
      } else {
        await this.alertController.create({
          header: 'Erro ao validar carrinho',
          message: 'Não foi possível confirmar a disponibilidade atual das reservas. Tente novamente.',
          backdropDismiss: false,
          buttons: ['Ok']
        }).then((alert) => alert.present());
      }

      return false;
    } finally {
      this.validatingAvailability = false;
      await loading.dismiss();
    }
  }

  private async handleCheckoutError(err: any): Promise<void> {
    if (err?.status === 409) {
      const conflicts = err?.error?.conflicts ?? [];
      await this.removeConflictingSlots(conflicts);
      await this.alertController.create({
        header: 'Slots indisponíveis',
        message: conflicts.length > 0
          ? `Algumas reservas do carrinho já não estão disponíveis ou já passaram da hora e foram removidas:<br><br>${this.formatConflictMessage(conflicts)}`
          : 'Algumas reservas do carrinho já não estão disponíveis.',
        backdropDismiss: false,
        buttons: ['Ok']
      }).then((alert) => alert.present());
      return;
    }

    if (err?.status === 422) {
      await this.alertController.create({
        header: 'Limite de reservas',
        message: err?.error?.message ?? 'O carrinho não cumpre as regras de reserva.',
        backdropDismiss: false,
        buttons: ['Ok']
      }).then((alert) => alert.present());
      return;
    }

    await this.alertController.create({
      header: 'Erro no meio de pagamento',
      message: 'Pode tentar novamente o checkout.',
      backdropDismiss: false,
      buttons: [{ text: 'Tentar novamente', role: 'cancel' }]
    }).then((alert) => alert.present());
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
