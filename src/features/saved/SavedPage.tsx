import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "@components/ui/GlassCard";
import { listFavorites } from "@features/saved/favoritesStore";
import { listRecentCards } from "@features/saved/historyStore";
import { listLearningStates } from "@features/saved/learningStore";
import type { LearningState, RecentCard, UserFavorite } from "@/db/schema";

export function SavedPage() {
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [recent, setRecent] = useState<RecentCard[]>([]);
  const [learning, setLearning] = useState<LearningState[]>([]);

  useEffect(() => {
    void Promise.all([listFavorites(), listRecentCards(), listLearningStates()]).then(([nextFavorites, nextRecent, nextLearning]) => {
      setFavorites(nextFavorites);
      setRecent(nextRecent);
      setLearning(nextLearning);
    });
  }, []);

  return (
    <div className="space-y-4 px-5 py-5">
      <GlassCard>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Guardadas</p>
        <h2 className="mt-2 font-display text-3xl">Favoritos e historial</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Datos locales en este dispositivo, sin cuenta ni sincronizacion remota.</p>
      </GlassCard>
      <GlassCard>
        <h3 className="font-display text-2xl">Favoritas</h3>
        {favorites.length === 0 && <p className="mt-2 text-sm text-muted">Todavia no guardaste cartas.</p>}
        {favorites.map((favorite) => <Link key={favorite.cardId} className="mt-2 block rounded-xl bg-surface p-3 text-sm text-gold" to={`/carta/${favorite.cardId}`}>{favorite.cardId.replaceAll("_", " ")}</Link>)}
      </GlassCard>
      <GlassCard>
        <h3 className="font-display text-2xl">Recientes</h3>
        {recent.length === 0 && <p className="mt-2 text-sm text-muted">El historial aparecera cuando abras detalles.</p>}
        {recent.map((item) => <Link key={item.cardId} className="mt-2 block rounded-xl bg-surface p-3 text-sm text-muted" to={`/carta/${item.cardId}`}>{item.cardId.replaceAll("_", " ")}</Link>)}
      </GlassCard>
      <GlassCard>
        <h3 className="font-display text-2xl">Aprendizaje</h3>
        {learning.length === 0 && <p className="mt-2 text-sm text-muted">Marca cartas para repasar desde futuras acciones.</p>}
        {learning.map((item) => <p key={item.cardId} className="mt-2 rounded-xl bg-surface p-3 text-sm text-muted">{item.cardId.replaceAll("_", " ")}: {item.status}</p>)}
      </GlassCard>
    </div>
  );
}
