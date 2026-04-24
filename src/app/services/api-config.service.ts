import { Injectable } from '@angular/core';

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
    return environment.api.remoteBaseUrl;
  }

  private extractOrigin(url: string): string {
    return new URL(url).origin;
  }
}
