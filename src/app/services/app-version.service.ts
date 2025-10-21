import { Injectable } from '@angular/core';

// Em iOS/Android vamos ler a versão via nativo;
// em web/dev usamos '0.0.0' só para prevenir.
@Injectable({ providedIn: 'root' })
export class AppVersionService {
  async getVersion(): Promise<{ version: string }> {
    try {
      // Capacitor não expõe versão diretamente; usamos CFBundleShortVersionString/VersionName
      // Obtida indiretamente mais abaixo pelo capawesome/app-update (quando necessário).
      // Aqui mantemos só a interface; vamos preencher no version-check.service.
      return { version: '0.0.0' };
    } catch {
      return { version: '0.0.0' };
    }
  }
}
