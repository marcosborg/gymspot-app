import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LoadingController,
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
    private preferences: PreferencesService,
  ) {
    addIcons({chevronBackOutline,chevronForwardOutline,cartOutline});
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
      const storedSlotsValue = storedSlots?.value ?? '[]'; // Handle null by providing a default value
      this.selectedSlots = JSON.parse(storedSlotsValue);
      this.applySelectedSlots();
    });
  }

  applySelectedSlots() {
    this.day.slots.forEach((daySlot: any) => {
      const isSelected = this.selectedSlots.some((slot) => slot.start === daySlot.start && slot.end === daySlot.end && slot.timestamp === daySlot.timestamp);
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

  selectSlot(slot: any) {
    if (slot.state === 'free' || slot.state === 'selected') {
      const index = this.selectedSlots.findIndex(selectedSlot => selectedSlot.start === slot.start && selectedSlot.end === slot.end && selectedSlot.timestamp === slot.timestamp);
      if (index > -1) {
        this.selectedSlots.splice(index, 1);
      } else {
        this.selectedSlots.push(slot);
      }
      this.saveSelectedSlots();
    }
  }

  isSlotSelected(slot: any) {
    return this.selectedSlots.some(selectedSlot => selectedSlot.start === slot.start && selectedSlot.end === slot.end && selectedSlot.timestamp === slot.timestamp);
  }

}
