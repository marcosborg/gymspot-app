import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  readonly authUrl: string;
  readonly publicUrl: string;
  readonly protectedUrl: string;
  readonly localOrigin: string;
  readonly remoteOrigin: string;
  readonly useRemoteMediaOrigin: boolean;

  constructor() {
    const baseUrl = this.resolveBaseUrl();

    this.localOrigin = this.extractOrigin(environment.api.localBaseUrl);
    this.remoteOrigin = this.extractOrigin(environment.api.remoteBaseUrl);
    this.useRemoteMediaOrigin = this.extractOrigin(baseUrl) === this.localOrigin;

    this.authUrl = `${baseUrl}/`;
    this.publicUrl = `${baseUrl}/v2/`;
    this.protectedUrl = `${baseUrl}/v1/`;
  }

  private resolveBaseUrl(): string {
    const platform = Capacitor.getPlatform();
    const isNativePlatform = Capacitor.isNativePlatform();
    const isWeb = platform === 'web';
    const isAndroid = platform === 'android';
    const isLocalHost = typeof window !== 'undefined'
      && ['localhost', '127.0.0.1'].includes(window.location.hostname);
    const nativeLocalBaseUrl = environment.api.localNativeBaseUrl || environment.api.localBaseUrl;

    // Browser/web dev always targets the local Laravel instance.
    if (isWeb || (!isNativePlatform && isLocalHost)) {
      return environment.api.localBaseUrl;
    }

    // Native Android dev uses the machine LAN IP instead of 127.0.0.1 so it
    // works even when adb reverse is unreliable.
    if (isAndroid && !environment.production) {
      return nativeLocalBaseUrl;
    }

    return environment.api.remoteBaseUrl;
  }

  private extractOrigin(url: string): string {
    return new URL(url).origin;
  }
}
