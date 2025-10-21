// src/app/services/version-check.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Platform } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { AppUpdate, AppUpdateAvailability } from '@capawesome/capacitor-app-update';

interface RemoteVersion {
  minVersion: string;
  latestVersion?: string;
  iosUrl?: string;
  androidUrl?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class VersionCheckService {
  private lastPromptKey = '';

  constructor(private http: HttpClient, private platform: Platform) {}

  // Versão instalada (cross-platform)
  async getInstalledVersion(): Promise<string> {
    try {
      const info = await App.getInfo(); // { name, id, version, build }
      return info.version ?? '0.0.0';
    } catch {
      return '0.0.0';
    }
  }

  // Busca JSON remoto com as versões/links
  async fetchRemote(): Promise<RemoteVersion | null> {
    try {
      return await firstValueFrom(
        this.http.get<RemoteVersion>(environment.updateConfig.versionUrl, {
          headers: { 'Cache-Control': 'no-cache' }
        })
      );
    } catch {
      return null;
    }
  }

  // comparação semver básica
  private cmp(a: string, b: string): number {
    const pa = a.split('.').map(n => parseInt(n, 10));
    const pb = b.split('.').map(n => parseInt(n, 10));
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const ai = pa[i] ?? 0;
      const bi = pb[i] ?? 0;
      if (ai > bi) return 1;
      if (ai < bi) return -1;
    }
    return 0;
  }

  mustForceUpdate(installed: string, remote: RemoteVersion): boolean {
    return this.cmp(installed, remote.minVersion) < 0;
  }

  getStoreUrl(remote?: RemoteVersion): string {
    if (this.platform.is('ios')) return remote?.iosUrl || environment.updateConfig.iosUrl;
    return remote?.androidUrl || environment.updateConfig.androidUrl;
  }

  alreadyPrompted(key: string) { return this.lastPromptKey === key; }
  markPrompted(key: string) { this.lastPromptKey = key; }

  // Android: tenta in-app update "immediate"; se não houver update disponível/permitido, devolve false
  async tryAndroidImmediateUpdate(): Promise<boolean> {
    try {
      const info = await AppUpdate.getAppUpdateInfo();
      if (info.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE) return false;
      if (!info.immediateUpdateAllowed) return false;
      await AppUpdate.performImmediateUpdate(); // lança se falhar
      return true;
    } catch {
      return false;
    }
  }

  // Abre App Store/Play Store. Se tiveres URL explícito, usa Browser.
  async openStore(url?: string) {
    try {
      if (url) {
        await Browser.open({ url });
      } else {
        await AppUpdate.openAppStore(); // usa o bundle/package atual
      }
    } catch {
      // silencioso
    }
  }
}
