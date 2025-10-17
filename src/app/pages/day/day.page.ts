import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LoadingController,
  AlertController,
  IonContent,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonNote,
  IonList,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline, cartOutline } from 'ionicons/icons';
import { PreferencesService } from 'src/app/services/preferences.service';
import { CartButtonComponent } from 'src/app/components/cart-button/cart-button.component';

@Component({
  selector: 'app-day',
  templateUrl: './day.page.html',
  styleUrls: ['./day.page.scss'],
  standalone: true,
  imports: [
    IonItem,
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonLabel,
    IonThumbnail,
    IonNote,
    IonList,
    IonButton,
    IonIcon,
    CartButtonComponent
  ]
})
export class DayPage implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private preferences: PreferencesService,
  ) {
    addIcons({ chevronBackOutline, chevronForwardOutline, cartOutline });
  }

  spot_id: any;
  year: any;
  currentMonth: any;
  dayNumber: any;

  day: any;
  selectedSlots: any[] = [];

  ngOnInit() {
    this.loadDayData();
  }

  async loadDayData() {
    const loading = await this.loadingController.create();
    await loading.present();
    this.spot_id = this.route.snapshot.params['spot_id'];
    this.year = this.route.snapshot.params['year'];
    this.currentMonth = this.route.snapshot.params['currentMonth'];
    this.dayNumber = this.route.snapshot.params['dayNumber'];
    const data = {
      spot_id: this.spot_id,
      year: this.year,
      currentMonth: this.currentMonth,
      dayNumber: this.dayNumber
    };
    this.api.getDay(data).subscribe(async (resp) => {
      await loading.dismiss();
      this.day = resp;
      const storedSlots = await this.preferences.checkName('selected_slots');
      const storedSlotsValue = storedSlots?.value ?? '[]';
      this.selectedSlots = JSON.parse(storedSlotsValue);
      this.applySelectedSlots();
    });
  }

  applySelectedSlots() {
    this.day.slots.forEach((daySlot: any) => {
      const isSelected = this.selectedSlots.some((slot) =>
        slot.start === daySlot.start && slot.end === daySlot.end && slot.timestamp === daySlot.timestamp
      );
      if (isSelected) {
        daySlot.state = 'selected';
      }
    });
  }

  async changeDay(year: number, month: number, day: number) {
    const loading = await this.loadingController.create();
    await loading.present();
    this.saveSelectedSlots();
    const data = {
      spot_id: this.spot_id,
      year: year,
      currentMonth: month,
      dayNumber: day
    };
    this.api.getDay(data).subscribe(async (resp) => {
      await loading.dismiss();
      this.day = resp;
      this.applySelectedSlots();
    });
  }

  pastDay() {
    this.changeDay(this.day.pastDay.year, this.day.pastDay.currentMonth, this.day.pastDay.dayNumber);
  }

  nextDay() {
    this.changeDay(this.day.nextDay.year, this.day.nextDay.currentMonth, this.day.nextDay.dayNumber);
  }

  saveSelectedSlots() {
    this.preferences.setName('selected_slots', JSON.stringify(this.selectedSlots));
  }

  /** ============================
   *  Regras de reservas por dia
   *  - Máx. 6 slots consecutivos (3h)
   *  - Novo bloco só após 4h desde o fim do último bloco
   *  ============================ */

  private getYmdFromTimestamp(ts: string): string {
    // "YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DD"
    return ts.split(' ')[0];
  }

  private toMinutes(hhmm: string): number {
    // "02:30" -> 150
    const [h, m] = hhmm.split(':').map((n: string) => parseInt(n, 10));
    return h * 60 + m;
  }

  private buildBlocksForDay(slots: any[]): Array<{ startMin: number; endMin: number; slotsCount: number }> {
    // Recebe slots todos do mesmo dia; usa start/end para construir blocos contíguos (30m)
    const items = slots
      .map(s => ({
        startMin: this.toMinutes(s.start),
        endMin: this.toMinutes(s.end)
      }))
      .sort((a, b) => a.startMin - b.startMin);

    const blocks: Array<{ startMin: number; endMin: number; slotsCount: number }> = [];
    for (const it of items) {
      const last = blocks[blocks.length - 1];
      if (!last) {
        blocks.push({ startMin: it.startMin, endMin: it.endMin, slotsCount: 1 });
      } else {
        // contíguo se o início = fim do anterior (intervalos de 30 minutos)
        if (it.startMin === last.endMin) {
          last.endMin = it.endMin;
          last.slotsCount += 1;
        } else {
          blocks.push({ startMin: it.startMin, endMin: it.endMin, slotsCount: 1 });
        }
      }
    }
    return blocks;
  }

  private async failRule(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Limite de reservas',
      message: 'Só pode reservar até 3 horas seguidas por dia (equivalente a 6 slots). Poderá voltar a reservar após 4 horas da sua última sessão.',
      buttons: [{ text: 'Entendi', role: 'cancel' }]
    });
    await alert.present();
  }

  private async validateDayRulesWithCandidate(candidate: any): Promise<boolean> {
    const ymd = this.getYmdFromTimestamp(candidate.timestamp);
    // slots já selecionados desse dia
    const daySelected = this.selectedSlots.filter(s => this.getYmdFromTimestamp(s.timestamp) === ymd);

    // construir lista temporária com o candidato
    const tempList = [...daySelected, candidate];

    // 1) formar blocos contíguos e validar limite de 6 slots por bloco
    const blocks = this.buildBlocksForDay(tempList);

    // regra 1: nenhum bloco pode ter mais que 6 slots (3h)
    const overSized = blocks.find(b => b.slotsCount > 6);
    if (overSized) {
      await this.failRule();
      return false;
    }

    // 2) regra 2: intervalo mínimo de 4h entre blocos
    // (ordenados por startMin; gap entre endMin do bloco i e startMin do bloco i+1)
    for (let i = 0; i < blocks.length - 1; i++) {
      const gap = blocks[i + 1].startMin - blocks[i].endMin;
      if (gap < 240) { // 4h = 240min
        await this.failRule();
        return false;
      }
    }

    return true;
  }

  async selectSlot(slot: any) {
    // permitir desmarcar sempre
    const index = this.selectedSlots.findIndex(selectedSlot =>
      selectedSlot.start === slot.start &&
      selectedSlot.end === slot.end &&
      selectedSlot.timestamp === slot.timestamp
    );
    if (index > -1) {
      this.selectedSlots.splice(index, 1);
      this.saveSelectedSlots();
      // atualizar estado visual
      slot.state = 'free';
      return;
    }

    // só permite selecionar se a slot estiver livre/selecionável
    if (!(slot.state === 'free' || slot.state === 'selected')) return;

    // valida regras para o dia desta slot
    const ok = await this.validateDayRulesWithCandidate(slot);
    if (!ok) return;

    // passou nas regras → adicionar e guardar
    this.selectedSlots.push(slot);
    this.saveSelectedSlots();
    slot.state = 'selected';
  }

  isSlotSelected(slot: any) {
    return this.selectedSlots.some(selectedSlot =>
      selectedSlot.start === slot.start &&
      selectedSlot.end === slot.end &&
      selectedSlot.timestamp === slot.timestamp
    );
  }
}
