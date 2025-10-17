import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonItem, IonList, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
  standalone: true,
  imports: [
    IonList,
    IonItem,
    IonSelect,
    IonSelectOption,
    CommonModule,
    FormsModule,
  ]
})
export class LocationsComponent implements OnInit {

  constructor(
    public api: ApiService,
    private router: Router
  ) { }

  locations: any = [];
  location_id: any;

  ngOnInit() {
    this.api.getLocations().subscribe((resp: any) => {
      this.locations = resp.data;
    });
  }

  goLocation() {
    this.router.navigateByUrl('/location/' + this.location_id);
  }

}
