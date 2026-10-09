"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import type { SavedItem, SavedKind } from "@/lib/user-store";

export type { SavedItem, SavedKind };

/* Tiny module-level store shared by every component on the page, so the nav badge,
   cards and article aside all agree without a provider. */
type Store<T> = { value: T | null; listeners: Set<(v: T | null) => void>; loading: Promise<void> | null };
function createStore<T>(): Store<T> { return { value: null, listeners: new Set(), loading: null }; }
function publish<T>(s: Store<T>, v: T | null) { s.value = v; s.listeners.forEach((l) => l(v)); }
function useStore<T>(s: Store<T>) {
  const [v, setV] = useState<T | null>(s.value);
  useEffect(() => { s.listeners.add(setV); setV(s.value); return () => { s.listeners.delete(setV); }; }, [s]);
  return v;
}

const savedStore = createStore<SavedItem[]>();
const progressStores = new Map<string, Store<string[]>>();
function progressStore(course: string) {
  let s = progressStores.get(course);
  if (!s) { s = createStore<string[]>(); progressStores.set(course, s); }
  return s;
}

async function load<T>(s: Store<T>, url: string, pick: (j: any) => T) {
  if (s.loading) return s.loading;
  s.loading = fetch(url).then(async (r) => { if (r.ok) publish(s, pick(await r.json())); }).catch(() => {}).finally(() => { s.loading = null; });
  return s.loading;
}

export function useSignIn() {
  const router = useRouter();
  const pathname = usePathname();
  return useCallback(() => router.push(`/signin?callbackUrl=${encodeURIComponent(pathname || "/")}`), [router, pathname]);
}

export function useSaved() {
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const items = useStore(savedStore);
  const requireSignIn = useSignIn();

  useEffect(() => {
    if (signedIn && savedStore.value === null) load(savedStore, "/api/saved", (j) => j.items ?? []);
    if (status === "unauthenticated" && savedStore.value !== null) publish(savedStore, null);
  }, [signedIn, status]);

  const list = items ?? [];
  const has = useCallback((kind: SavedKind, slug: string) => list.some((s) => s.kind === kind && s.slug === slug), [list]);
  const toggle = useCallback(async (item: Omit<SavedItem, "added">) => {
    if (!signedIn) { requireSignIn(); return; }
    const prev = savedStore.value ?? [];
    const exists = prev.some((s) => s.kind === item.kind && s.slug === item.slug);
    publish(savedStore, exists ? prev.filter((s) => !(s.kind === item.kind && s.slug === item.slug)) : [{ ...item, added: Date.now() }, ...prev]);
    const r = await fetch("/api/saved", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ item }) });
    if (r.ok) publish(savedStore, (await r.json()).items ?? []); else publish(savedStore, prev);
  }, [signedIn, requireSignIn]);

  return { signedIn, ready: !signedIn || items !== null, items: list, count: list.length, has, toggle };
}

export function useProgress(course: string) {
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const store = progressStore(course);
  const done = useStore(store);
  const requireSignIn = useSignIn();

  useEffect(() => {
    if (signedIn && store.value === null) load(store, `/api/progress?course=${encodeURIComponent(course)}`, (j) => j.done ?? []);
    if (status === "unauthenticated" && store.value !== null) publish(store, null);
  }, [signedIn, status, store, course]);

  const list = done ?? [];
  const isDone = useCallback((slug: string) => list.includes(slug), [list]);
  const setDone = useCallback(async (slug: string, value: boolean) => {
    if (!signedIn) { requireSignIn(); return; }
    const prev = store.value ?? [];
    publish(store, value ? Array.from(new Set([...prev, slug])) : prev.filter((s) => s !== slug));
    const r = await fetch("/api/progress", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ course, slug, done: value }) });
    if (r.ok) publish(store, (await r.json()).done ?? []); else publish(store, prev);
  }, [signedIn, requireSignIn, store, course]);
  const reset = useCallback(async () => {
    if (!signedIn) return;
    publish(store, []);
    await fetch("/api/progress", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ course, reset: true }) });
  }, [signedIn, store, course]);

  return { signedIn, ready: !signedIn || done !== null, done: list, isDone, setDone, reset, requireSignIn };
}
