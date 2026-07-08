import type {
  BadgeConquistado,
  Empresa,
  LikeEmpresa,
  Mensagem,
  Profile,
  Swipe,
  Talento,
  Vaga,
} from "./types";
import { deviceId, novoId } from "./uid";
import seedVagas from "./seed-data.json";
import seedEmpresas from "./seed-empresas.json";
import seedTalentos from "./seed-talentos.json";

/**
 * Camada de dados local-first.
 *  - Núcleo do candidato (profile/swipes/mensagens) tem par Supabase
 *    (migrations em supabase/) e liga via env vars.
 *  - Entidades novas (empresas, talentos, badges, CRUD de vagas,
 *    hunter/admin) são locais no MVP — contrato pronto p/ nuvem.
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
  // --- v2 ---
  getEmpresas(): Promise<Empresa[]>;
  getTalentos(): Promise<Talento[]>;
  addVaga(v: Omit<Vaga, "id" | "created_at">): Promise<Vaga>;
  updateVaga(id: string, patch: Partial<Vaga>): Promise<void>;
  getBadges(): Promise<BadgeConquistado[]>;
  addBadge(badgeId: string): Promise<void>;
  getShortlist(): Promise<string[]>;
  toggleShortlist(talentoId: string): Promise<string[]>;
  getLikesEmpresa(): Promise<LikeEmpresa[]>;
  likeTalento(empresaId: string, talentoId: string): Promise<void>;
}

const K = {
  profile: "trampolim:profile",
  swipes: "trampolim:swipes",
  msgs: "trampolim:mensagens",
  badges: "trampolim:badges",
  vagasCustom: "trampolim:vagas_custom",
  vagasPatch: "trampolim:vagas_patch",
  shortlist: "trampolim:shortlist",
  likesEmpresa: "trampolim:likes_empresa",
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

// ---------------------------------------------------------------- local
class LocalStore implements Store {
  async getVagas(): Promise<Vaga[]> {
    const custom = lsGet<Vaga[]>(K.vagasCustom, []);
    const patch = lsGet<Record<string, Partial<Vaga>>>(K.vagasPatch, {});
    const base = (seedVagas as Vaga[]).map((v) =>
      patch[v.id] ? { ...v, ...patch[v.id] } : v,
    );
    const custom2 = custom.map((v) =>
      patch[v.id] ? { ...v, ...patch[v.id] } : v,
    );
    return [...custom2, ...base];
  }

  async getProfile(): Promise<Profile | null> {
    const p = lsGet<Profile | null>(K.profile, null);
    if (!p) return null;
    return {
      experiencias: [],
      formacao: [],
      idiomas: [],
      ...p,
    };
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

  // --- v2 ---
  async getEmpresas(): Promise<Empresa[]> {
    return seedEmpresas as Empresa[];
  }

  async getTalentos(): Promise<Talento[]> {
    return seedTalentos as Talento[];
  }

  async addVaga(v: Omit<Vaga, "id" | "created_at">): Promise<Vaga> {
    const vaga: Vaga = { ...v, id: novoId(), created_at: new Date().toISOString() };
    lsSet(K.vagasCustom, [vaga, ...lsGet<Vaga[]>(K.vagasCustom, [])]);
    return vaga;
  }

  async updateVaga(id: string, patch: Partial<Vaga>): Promise<void> {
    const patches = lsGet<Record<string, Partial<Vaga>>>(K.vagasPatch, {});
    patches[id] = { ...patches[id], ...patch };
    lsSet(K.vagasPatch, patches);
  }

  async getBadges(): Promise<BadgeConquistado[]> {
    return lsGet<BadgeConquistado[]>(K.badges, []);
  }

  async addBadge(badgeId: string): Promise<void> {
    const all = await this.getBadges();
    if (all.some((b) => b.badge_id === badgeId)) return;
    lsSet(K.badges, [...all, { badge_id: badgeId, em: new Date().toISOString() }]);
  }

  async getShortlist(): Promise<string[]> {
    return lsGet<string[]>(K.shortlist, []);
  }

  async toggleShortlist(talentoId: string): Promise<string[]> {
    const atual = await this.getShortlist();
    const nova = atual.includes(talentoId)
      ? atual.filter((t) => t !== talentoId)
      : [...atual, talentoId];
    lsSet(K.shortlist, nova);
    return nova;
  }

  async getLikesEmpresa(): Promise<LikeEmpresa[]> {
    return lsGet<LikeEmpresa[]>(K.likesEmpresa, []);
  }

  async likeTalento(empresaId: string, talentoId: string): Promise<void> {
    const all = await this.getLikesEmpresa();
    if (all.some((l) => l.empresa_id === empresaId && l.talento_id === talentoId))
      return;
    lsSet(K.likesEmpresa, [
      ...all,
      { empresa_id: empresaId, talento_id: talentoId, em: new Date().toISOString() },
    ]);
  }
}

// ------------------------------------------------------------- supabase
/**
 * Núcleo candidato na nuvem; entidades v2 delegam ao LocalStore até a
 * fase 2 (ver README > Roadmap).
 */
class SupabaseStore extends LocalStore {
  private async client() {
    const { createClient } = await import("@supabase/supabase-js");
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }

  override async getVagas(): Promise<Vaga[]> {
    const supa = await this.client();
    const { data, error } = await supa
      .from("trampolim_vagas")
      .select("*")
      .eq("ativa", true);
    if (error) throw error;
    return data as Vaga[];
  }

  override async getProfile(): Promise<Profile | null> {
    const supa = await this.client();
    const { data } = await supa
      .from("trampolim_profiles")
      .select("*")
      .eq("id", deviceId())
      .maybeSingle();
    return (data as Profile) ?? null;
  }

  override async saveProfile(p: Profile): Promise<void> {
    const supa = await this.client();
    const { error } = await supa
      .from("trampolim_profiles")
      .upsert({ ...p, id: deviceId(), updated_at: new Date().toISOString() });
    if (error) throw error;
  }

  override async getSwipes(): Promise<Swipe[]> {
    const supa = await this.client();
    const { data, error } = await supa
      .from("trampolim_swipes")
      .select("*")
      .eq("user_id", deviceId());
    if (error) throw error;
    return data as Swipe[];
  }

  override async addSwipe(
    s: Omit<Swipe, "id" | "created_at" | "user_id">,
  ): Promise<Swipe> {
    const supa = await this.client();
    const { data, error } = await supa
      .from("trampolim_swipes")
      .upsert({ ...s, user_id: deviceId() }, { onConflict: "user_id,vaga_id" })
      .select()
      .single();
    if (error) throw error;
    return data as Swipe;
  }

  override async removeSwipe(id: string): Promise<void> {
    const supa = await this.client();
    await supa.from("trampolim_swipes").delete().eq("id", id);
  }

  override async resetSwipes(): Promise<void> {
    const supa = await this.client();
    await supa.from("trampolim_swipes").delete().eq("user_id", deviceId());
  }

  override async getMensagens(swipeId: string): Promise<Mensagem[]> {
    const supa = await this.client();
    const { data, error } = await supa
      .from("trampolim_mensagens")
      .select("*")
      .eq("swipe_id", swipeId)
      .order("created_at");
    if (error) throw error;
    return data as Mensagem[];
  }

  override async addMensagem(
    m: Omit<Mensagem, "id" | "created_at">,
  ): Promise<Mensagem> {
    const supa = await this.client();
    const { data, error } = await supa
      .from("trampolim_mensagens")
      .insert(m)
      .select()
      .single();
    if (error) throw error;
    return data as Mensagem;
  }

  override async clearAll(): Promise<void> {
    const supa = await this.client();
    const uid = deviceId();
    await supa.from("trampolim_swipes").delete().eq("user_id", uid);
    await supa.from("trampolim_profiles").delete().eq("id", uid);
    await super.clearAll();
    localStorage.removeItem("trampolim:device_id");
  }
}

const supabaseAtivo =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const store: Store = supabaseAtivo ? new SupabaseStore() : new LocalStore();
export const MODO_DADOS = supabaseAtivo ? "supabase" : "local";
