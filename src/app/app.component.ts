import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import {
  IonApp,
  IonAvatar,
  IonContent,
  IonHeader,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonRouterOutlet,
  IonSplitPane,
  IonToolbar,
  MenuController,
  IonButton,
  IonBadge,
  IonNote
} from '@ionic/angular/standalone';
import { ApiService } from './services/api.service';
import { CommonModule } from '@angular/common';

// ↓↓↓ ADIÇÕES PARA O CHECK DE VERSÃO ↓↓↓
import { AlertController, Platform } from '@ionic/angular';
import { VersionCheckService } from './services/version-check.service';
import { App } from '@capacitor/app';
import { filter, debounceTime } from 'rxjs/operators';
// ↑↑↑ FIM DAS ADIÇÕES ↑↑↑

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonSplitPane,
    RouterLink,
    RouterLinkActive,
    IonContent,
    IonList,
    IonLabel,
    CommonModule,
    IonImg,
    IonHeader,
    IonToolbar,
    IonItem,
    IonAvatar,
    IonListHeader,
    IonButton,
    IonBadge,
    IonNote
  ],
})
export class AppComponent implements OnInit {
  constructor(
    public router: Router,
    private menu: MenuController,
    private api: ApiService,

    // ↓↓↓ INJETADOS PARA O CHECK DE VERSÃO ↓↓↓
    private platform: Platform,
    private alertCtrl: AlertController,
    private versionCheck: VersionCheckService
    // ↑↑↑ FIM ↑↑↑
  ) {}

  // --- estado atual da tua app ---
  menus: any = [];
  spots: any = [];
  pts: any = [];
  utils: any = [];

  // --- flag interna para não repetir checks em paralelo ---
  private checking = false;

  async ngOnInit() {
    // Mantém o teu comportamento atual
    this.router.events.subscribe(() => {
      this.menu.close();
    });

    this.api.getPts(2).subscribe((resp: any) => {
      this.pts = resp.data;
    });
    this.api.getMenus().subscribe((resp: any) => {
      this.menus = resp.data;
    });
    this.api.getSpots(3).subscribe((resp: any) => {
      this.spots = resp.data;
    });
    this.api.getCategoryPages(1).subscribe((resp: any) => {
      this.utils = resp.data;
    });

    // ↓↓↓ ADIÇÕES: lifecycle + navegação + check inicial ↓↓↓
    await this.platform.ready();

    // Check ao retomar a app do background
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) this.checkNow();
    });

    // Check a cada navegação (com debounce curto)
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), debounceTime(150))
      .subscribe(() => this.checkNow());

    // Check no arranque
    this.checkNow();
    // ↑↑↑ FIM ADIÇÕES ↑↑↑
  }

  goSpot(spot_id: any, soon: any) {
    if (soon === false) {
      this.router.navigateByUrl('spot/' + spot_id);
    }
  }

  // ↓↓↓ IMPLEMENTAÇÃO DO CHECK/ALERTA ↓↓↓
  private async checkNow() {
    if (this.checking) return;
    this.checking = true;
    try {
      const installed = await this.versionCheck.getInstalledVersion();
      const remote = await this.versionCheck.fetchRemote();
      if (!remote) return;

      const key = `min:${remote.minVersion}`;
      if (this.versionCheck.alreadyPrompted(key)) return;

      if (this.versionCheck.mustForceUpdate(installed, remote)) {
        this.versionCheck.markPrompted(key);
        await this.showForceUpdateAlert(remote.message, remote);
      }
    } finally {
      this.checking = false;
    }
  }

  private async showForceUpdateAlert(message?: string, remote?: any) {
    const alert = await this.alertCtrl.create({
      header: 'Atualização necessária',
      message: message || 'Há uma nova versão do Gym Spot. Instala para continuar.',
      backdropDismiss: false, // bloqueia o backdrop
      buttons: [
        {
          text: 'Atualizar agora',
          handler: async () => {
            // Android: tenta "immediate update"; se falhar, abre a store
            const ok = this.platform.is('android')
              ? await this.versionCheck.tryAndroidImmediateUpdate()
              : false;
            if (!ok) await this.versionCheck.openStore(this.versionCheck.getStoreUrl(remote));
          }
        },
        {
          text: this.platform.is('android') ? 'Sair' : 'Fechar',
          role: 'destructive',
          handler: () => {
            if (this.platform.is('android')) App.exitApp();
            // iOS não permite fechar programaticamente
          }
        }
      ]
    });
    await alert.present();
  }
  // ↑↑↑ FIM DO CHECK/ALERTA ↑↑↑
}
