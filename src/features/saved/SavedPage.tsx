import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "@components/ui/GlassCard";
import { PremiumRow, SectionHeader, StatePanel } from "@components/ui/MysticPrimitives";
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
        <SectionHeader eyebrow="Guardadas" title="Favoritos e historial" description="Datos locales en este dispositivo, sin cuenta ni sincronizacion remota." />
      </GlassCard>
      <GlassCard>
        <h3 className="font-display text-2xl text-ink">Favoritas</h3>
        {favorites.length === 0 && <StatePanel className="mt-3" title="Sin favoritas">Guarda una carta desde busqueda o detalle para tenerla a mano.</StatePanel>}
        <div className="mt-3 space-y-2">
          {favorites.map((favorite) => <Link key={favorite.cardId} className="block" to={`/carta/${favorite.cardId}`}><PremiumRow><p className="text-sm font-semibold text-gold">{favorite.cardId.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-muted">Favorita local · tocar para abrir</p></PremiumRow></Link>)}
        </div>
      </GlassCard>
      <GlassCard>
        <h3 className="font-display text-2xl text-ink">Recientes</h3>
        {recent.length === 0 && <StatePanel className="mt-3" title="Historial listo">El historial aparecera cuando abras detalles de cartas.</StatePanel>}
        <div className="mt-3 space-y-2">
          {recent.map((item) => <Link key={item.cardId} className="block" to={`/carta/${item.cardId}`}><PremiumRow><p className="text-sm font-semibold text-ink">{item.cardId.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-muted">Origen: {item.source} · tocar para volver</p></PremiumRow></Link>)}
        </div>
      </GlassCard>
      <GlassCard>
        <h3 className="font-display text-2xl text-ink">Aprendizaje</h3>
        {learning.length === 0 && <StatePanel className="mt-3" title="Modo practica">Marca cartas para repasar desde futuras acciones.</StatePanel>}
        <div className="mt-3 space-y-2">
          {learning.map((item) => <PremiumRow key={item.cardId}><p className="text-sm font-semibold text-ink">{item.cardId.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-muted">Estado: {item.status}</p></PremiumRow>)}
        </div>
      </GlassCard>
    </div>
  );
}
