import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "@components/ui/GlassCard";
import type { CardSummary, SearchDoc } from "@/data/cardTypes";
import { buildSearchLookup, createMiniSearch, searchCards } from "@features/search/searchEngine";
import { normalizeQuery } from "@features/search/searchNormalize";
import { copyText } from "@/lib/clipboard";
import { saveFavorite } from "@features/saved/favoritesStore";
import { runRecoverableStorageAction } from "@features/saved/storageFeedback";

const chips = ["Todos", "Mayores", "Copas", "Espadas", "Bastos", "Oros"];

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [summaries, setSummaries] = useState<CardSummary[]>([]);
  const [docs, setDocs] = useState<SearchDoc[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/data/cards.summary.v1.json").then((response) => response.json() as Promise<CardSummary[]>),
      fetch("/data/cards.search-docs.v1.json").then((response) => response.json() as Promise<SearchDoc[]>)
    ]).then(([nextSummaries, nextDocs]) => {
      if (!cancelled) {
        setSummaries(nextSummaries);
        setDocs(nextDocs);
        setLoadState("ready");
      }
    }).catch(() => {
      if (!cancelled) setLoadState("error");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const engine = useMemo(() => {
    if (summaries.length === 0 || docs.length === 0) return undefined;
    return { lookup: buildSearchLookup(summaries, docs), miniSearch: createMiniSearch(docs) };
  }, [summaries, docs]);

  const normalized = normalizeQuery(query).normalized;
  const results = useMemo(() => {
    if (!engine || !normalized) return [];
    return searchCards(normalized, engine.lookup, engine.miniSearch).slice(0, 8).map((result) => engine.lookup.byId.get(result.id)).filter(Boolean) as CardSummary[];
  }, [engine, normalized]);

  return (
    <div className="space-y-5 px-5 py-5">
      <section className="space-y-3">
        <p className="text-sm text-muted">Que carta salio?</p>
        <label className="block">
          <span className="sr-only">Buscar carta, numero o keyword</span>
          <input
            className="min-h-[52px] w-full rounded-2xl border border-[color:var(--color-border)] bg-surface px-4 text-base text-ink placeholder:text-muted"
            placeholder="Buscar carta, numero o keyword..."
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filtros rapidos">
          {chips.map((chip) => (
            <button key={chip} className="min-h-11 shrink-0 rounded-full border border-[color:var(--color-border)] px-4 text-sm text-muted" type="button">
              {chip}
            </button>
          ))}
        </div>
      </section>

      {!query && <GlassCard>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Estado inicial</p>
        <h2 className="mt-2 font-display text-3xl text-ink">Busca en menos de 3 segundos</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Proba La Luna, 3 espadas, amor o XVIII.</p>
        <div className="mt-4 flex gap-2">
          <Link className="min-h-11 rounded-full bg-gold px-4 py-3 text-sm font-semibold text-background" to="/carta/the_moon">Ver ejemplo</Link>
          <Link className="min-h-11 rounded-full border border-[color:var(--color-border)] px-4 py-3 text-sm text-gold" to="/cartas">Cartas</Link>
        </div>
      </GlassCard>}

      {query && loadState === "loading" && <GlassCard><p className="text-muted">Cargando indice local...</p></GlassCard>}
      {query && loadState === "error" && <GlassCard><p className="text-muted">Modo offline: no pude cargar el indice todavia.</p></GlassCard>}
      {query && loadState === "ready" && results.length === 0 && (
        <GlassCard>
          <h2 className="font-display text-2xl">No encontre esa carta.</h2>
          <p className="mt-2 text-sm text-muted">Proba con nombre, numero o una palabra como amor.</p>
        </GlassCard>
      )}
      {results.map((card) => (
        <GlassCard key={card.id} className="flex gap-3">
          <img className="h-24 w-16 rounded-xl border border-[color:var(--color-border)] object-cover" src={card.thumbnail} alt="" loading="lazy" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl text-ink">{card.nameEs}</h2>
            <p className="text-sm text-muted">{card.keywordsUpright.slice(0, 3).join(" · ")}</p>
            <p className="mt-2 text-sm text-ink">Derecha: {card.oneLineUpright}</p>
            <p className="mt-1 text-sm text-muted">Invertida: {card.oneLineReversed}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link className="rounded-full bg-gold px-3 py-2 text-xs font-semibold text-background" to={`/carta/${card.id}`}>Ver</Link>
              <button className="rounded-full border border-[color:var(--color-border)] px-3 py-2 text-xs text-gold" type="button" onClick={() => void copyText(`${card.nameEs}: ${card.oneLineUpright}`)}>Copiar</button>
              <button className="rounded-full border border-[color:var(--color-border)] px-3 py-2 text-xs text-gold" type="button" onClick={() => void runRecoverableStorageAction(() => saveFavorite(card.id))}>Guardar</button>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
