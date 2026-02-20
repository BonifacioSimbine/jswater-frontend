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
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      // Se for um objeto válido, retorna normalmente
      if (parsed && typeof parsed === 'object' && parsed.name && parsed.token) {
        return parsed;
      }
      // Se for apenas um token string antigo, retorna um objeto padrão
      if (typeof parsed === 'string') {
        return { name: 'Usuário', role: '', token: parsed };
      }
      return null;
    } catch {
      // Se não for JSON, pode ser um token string antigo
      return { name: 'Usuário', role: '', token: raw };
    }
  }

  setUser(user: AuthUser): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  clearUser(): void {
    localStorage.removeItem(this.storageKey);
  }
}
