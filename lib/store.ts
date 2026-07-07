import type { Mensagem, Profile, Swipe, Vaga } from "./types";
import { deviceId, novoId } from "./uid";
import seed from "./seed-data.json";

/**
 * Camada de dados com dois modos:
 *  - LocalStore (padrão): tudo em localStorage + vagas do seed. Zero backend.
 *  - SupabaseStore: ativado automaticamente quando NEXT_PUBLIC_SUPABASE_URL
 *    e NEXT_PUBLIC_SUPABASE_ANON_KEY existem. Mesma interface.
 * Migrations SQL em supabase/migrations/ — o schema espelha estes tipos.
 */
export interface Store {
  getVagas(): Promise<Vaga[]>;
  getProfile(): Promise<Profile | null>;
  saveProfile(p: Profile): Promise<void>;
  getSwipes(): Promise<Swipe[]>;
  addSwipe(s: Omit<Swipe, "id" | "created_at" | "user_id">): Promise<Swipe>;
  removeSwipe(id: string): Promise<void>;
  resetSwipes(): Promise<void>;
  getMensagens(swipeId: string): Promise<Mensagem[]>;
  addMensagem(m: Omit<Mensagem, "id" | "created_at">): Promise<Mensagem>;
  clearAll(): Promise<void>;
}

// ---------------------------------------------------------------- local
const K = {
  profile: "trampolim:profile",
  swipes: "trampolim:swipes",
  msgs: "trampolim:mensagens",
};

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

class LocalStore implements Store {
  async getVagas(): Promise<Vaga[]> {
    return seed as Vaga[];
  }

  async getProfile(): Promise<Profile | null> {
    return lsGet<Profile | null>(K.profile, null);
  }

  async saveProfile(p: Profile): Promise<void> {
    lsSet(K.profile, p);
  }

  async getSwipes(): Promise<Swipe[]> {
    return lsGet<Swipe[]>(K.swipes, []);
  }

  async addSwipe(s: Omit<Swipe, "id" | "created_at" | "user_id">): Promise<Swipe> {
    const swipe: Swipe = {
      ...s,
      id: novoId(),
      user_id: deviceId(),
      created_at: new Date().toISOString(),
    };
    const all = await this.getSwipes();
    lsSet(K.swipes, [...all.filter((x) => x.vaga_id !== s.vaga_id), swipe]);
    return swipe;
  }

  async removeSwipe(id: string): Promise<void> {
    const all = await this.getSwipes();
    lsSet(K.swipes, all.filter((x) => x.id !== id));
    const msgs = lsGet<Mensagem[]>(K.msgs, []);
    lsSet(K.msgs, msgs.filter((m) => m.swipe_id !== id));
  }

  async resetSwipes(): Promise<void> {
    lsSet(K.swipes, []);
    lsSet(K.msgs, []);
  }

  async getMensagens(swipeId: string): Promise<Mensagem[]> {
    return lsGet<Mensagem[]>(K.msgs, []).filter((m) => m.swipe_id === swipeId);
  }

  async addMensagem(m: Omit<Mensagem, "id" | "created_at">): Promise<Mensagem> {
    const msg: Mensagem = {
      ...m,
      id: novoId(),
      created_at: new Date().toISOString(),
    };
    const all = lsGet<Mensagem[]>(K.msgs, []);
    lsSet(K.msgs, [...all, msg]);
    return msg;
  }

  async clearAll(): Promise<void> {
    Object.values(K).forEach((k) => localStorage.removeItem(k));
  }
}

// ------------------------------------------------------------- supabase
class SupabaseStore implements Store {
  // Import dinâmico para o bundle local não pagar pelo supabase-js.
  private async client() {
    const { createClient } = await import("@supabase/supabase-js");
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }

  async getVagas(): Promise<Vaga[]> {
    const supa = await this.client();
    const { data, error } = await supa
      .from("trampolim_vagas")
      .select("*")
      .eq("ativa", true);
    if (error) throw error;
    return data as Vaga[];
  }

  async getProfile(): Promise<Profile | null> {
    const supa = await this.client();
    const { data } = await supa
      .from("trampolim_profiles")
      .select("*")
      .eq("id", deviceId())
      .maybeSingle();
    return (data as Profile) ?? null;
  }

  async saveProfile(p: Profile): Promise<void> {
    const supa = await this.client();
    const { error } = await supa
      .from("trampolim_profiles")
      .upsert({ ...p, id: deviceId(), updated_at: new Date().toISOString() });
    if (error) throw error;
  }

  async getSwipes(): Promise<Swipe[]> {
    const supa = await this.client();
    const { data, error } = await supa
      .from("trampolim_swipes")
      .select("*")
      .eq("user_id", deviceId());
    if (error) throw error;
    return data as Swipe[];
  }

  async addSwipe(s: Omit<Swipe, "id" | "created_at" | "user_id">): Promise<Swipe> {
    const supa = await this.client();
    const { data, error } = await supa
      .from("trampolim_swipes")
      .upsert(
        { ...s, user_id: deviceId() },
        { onConflict: "user_id,vaga_id" },
      )
      .select()
      .single();
    if (error) throw error;
    return data as Swipe;
  }

  async removeSwipe(id: string): Promise<void> {
    const supa = await this.client();
    await supa.from("trampolim_swipes").delete().eq("id", id);
  }

  async resetSwipes(): Promise<void> {
    const supa = await this.client();
    await supa.from("trampolim_swipes").delete().eq("user_id", deviceId());
  }

  async getMensagens(swipeId: string): Promise<Mensagem[]> {
    const supa = await this.client();
    const { data, error } = await supa
      .from("trampolim_mensagens")
      .select("*")
      .eq("swipe_id", swipeId)
      .order("created_at");
    if (error) throw error;
    return data as Mensagem[];
  }

  async addMensagem(m: Omit<Mensagem, "id" | "created_at">): Promise<Mensagem> {
    const supa = await this.client();
    const { data, error } = await supa
      .from("trampolim_mensagens")
      .insert(m)
      .select()
      .single();
    if (error) throw error;
    return data as Mensagem;
  }

  async clearAll(): Promise<void> {
    const supa = await this.client();
    const uid = deviceId();
    await supa.from("trampolim_swipes").delete().eq("user_id", uid);
    await supa.from("trampolim_profiles").delete().eq("id", uid);
    localStorage.removeItem("trampolim:device_id");
  }
}

const supabaseAtivo =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const store: Store = supabaseAtivo ? new SupabaseStore() : new LocalStore();
export const MODO_DADOS = supabaseAtivo ? "supabase" : "local";
