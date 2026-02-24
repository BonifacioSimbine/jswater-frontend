import { Injectable } from '@angular/core';

export interface AuthUser {
  name: string;
  role: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'auth_token';

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(this.storageKey);
    console.log('[AuthService] getUser() raw:', raw);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      console.log('[AuthService] getUser() parsed:', parsed);
      // Se for um objeto válido, retorna normalmente
      if (parsed && typeof parsed === 'object' && parsed.name && parsed.token) {
        return parsed;
      }
      // Se for apenas um token string antigo, retorna um objeto padrão
      if (typeof parsed === 'string') {
        return { name: 'Usuário', role: '', token: parsed };
      }
      return null;
    } catch (e) {
      console.warn('[AuthService] getUser() JSON parse error:', e);
      // Se não for JSON, pode ser um token string antigo
      return { name: 'Usuário', role: '', token: raw };
    }
  }

  setUser(user: AuthUser): void {
    // Padroniza o role para minúsculo
    const normalizedUser = { ...user, role: user.role ? user.role.toLowerCase() : '' };
    console.log('[AuthService] setUser() user:', normalizedUser);
    localStorage.setItem(this.storageKey, JSON.stringify(normalizedUser));
    console.log('[AuthService] setUser() localStorage:', localStorage.getItem(this.storageKey));
  }

  clearUser(): void {
    console.log('[AuthService] clearUser()');
    localStorage.removeItem(this.storageKey);
  }
}
