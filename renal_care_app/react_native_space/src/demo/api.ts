import { DEMO_PROFILES, DEMO_EMAILS, clinicalHistory, treatment, diet, ambulance } from './fixtures';
import type { ContactMessageResponseDto } from '../api/generated/schemas';

export const DEMO_TOKEN_KEY = 'renalcare_demo_auth_token';
interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
export class DemoApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/** Esta API no utiliza fetch ni dispone de salida hacia un servidor. */
export function createDemoApi(storage: Storage, clock = () => new Date()) {
  return async function demoRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const path = url.split('?')[0];
    const method = (options.method ?? 'GET').toUpperCase();
    if (path === '/api/auth/login' && method === 'POST') {
      const body = JSON.parse(String(options.body ?? '{}'));
      const index = DEMO_EMAILS.indexOf(String(body.email ?? '').trim().toLowerCase());
      if (index < 0 || body.password !== 'demo123') throw new DemoApiError(401, 'Usa uno de los perfiles de demostración.');
      const p = DEMO_PROFILES[index];
      return { token: `demo:${p.id}`, user: { id: p.userId, email: DEMO_EMAILS[index], name: p.fullName } } as T;
    }
    const token = await storage.getItem(DEMO_TOKEN_KEY);
    const index = DEMO_PROFILES.findIndex(p => token === `demo:${p.id}`);
    if (index < 0) throw new DemoApiError(401, 'Selecciona un perfil de demostración.');
    const p = DEMO_PROFILES[index];
    const key = `renalcare_demo_messages:${p.id}`;
    if (method === 'GET') {
      const routes: Record<string, () => unknown> = {
        '/api/auth/me': () => ({ user: { id: p.userId, email: DEMO_EMAILS[index], name: p.fullName } }),
        '/api/patients/me': () => ({ ...p }),
        '/api/patients/me/clinical-history': () => clinicalHistory(index, clock()),
        '/api/patients/me/treatment': () => treatment(index, clock()),
        '/api/patients/me/diet': () => diet(index),
        '/api/patients/me/ambulance': () => ambulance(index),
        '/api/contact-messages': async () => ({ items: JSON.parse(await storage.getItem(key) ?? '[]') }),
      };
      if (routes[path]) return await routes[path]() as T;
    }
    if (path === '/api/contact-messages' && method === 'POST') {
      const body = JSON.parse(String(options.body ?? '{}'));
      const subject = String(body.subject ?? '').trim();
      const message = String(body.message ?? '').trim();
      if (!subject || message.length < 10 || subject.length > 200 || message.length > 5000) {
        throw new DemoApiError(400, 'Asunto obligatorio y mensaje de 10 a 5000 caracteres.');
      }
      const items: ContactMessageResponseDto[] = JSON.parse(await storage.getItem(key) ?? '[]');
      const now = clock().toISOString();
      const item = { id: `demo-${now}-${items.length}`, subject, message, status: 'Simulado · No enviado', createdAt: now };
      // Mantener una cantidad acotada de consultas ficticias en este dispositivo.
      await storage.setItem(key, JSON.stringify([item, ...items].slice(0, 50)));
      return item as T;
    }
    throw new DemoApiError(404, 'Función no disponible en la demo sin conexión.');
  };
}
