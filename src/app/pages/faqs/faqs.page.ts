import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent, IonCardHeader, IonContent, IonText } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.page.html',
  styleUrls: ['./faqs.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    HeaderComponent,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonText
  ],

})
export class FaqsPage implements OnInit {

  constructor(
    private api: ApiService
  ) { }

  faqs: any = [];

  ngOnInit() {
    this.api.getFaqs().subscribe((resp: any) => {
      this.faqs = resp.data.map((faq: any) => ({
        ...faq,
        isExpanded: false // Adiciona a propriedade isExpanded a cada FAQ
      }));
    });
  }

  toggleAnswer(faqId: number) {
    this.faqs = this.faqs.map((faq: { id: number; isExpanded: any; }) => {
      if (faq.id === faqId) {
        return { ...faq, isExpanded: !faq.isExpanded };
      }
      return faq;
    });
  }

}
