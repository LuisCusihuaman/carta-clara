import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "@components/ui/GlassCard";
import { ActionButton, Chip, PremiumRow, SectionHeader, StatePanel, TarotFrame } from "@components/ui/MysticPrimitives";
import type { CardSummary, SearchDoc } from "@/data/cardTypes";
import { buildSearchLookup, createMiniSearch, searchCards } from "@features/search/searchEngine";
import { normalizeQuery } from "@features/search/searchNormalize";
import { copyText } from "@/lib/clipboard";
import { saveFavorite } from "@features/saved/favoritesStore";
import { runRecoverableStorageAction } from "@features/saved/storageFeedback";

const chips = ["La Luna", "Amor", "3 espadas", "XVIII", "Trabajo", "Consejo"];

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
      <section className="space-y-4">
        <SectionHeader eyebrow="Oraculo rapido" title="Que carta salio?" description="Busca por nombre, numero, palo o una palabra de la pregunta." />
        <label className="block">
          <span className="sr-only">Buscar carta, numero o keyword</span>
          <div className="mystic-panel flex min-h-[62px] items-center gap-3 rounded-[1.7rem] px-4">
            <span className="text-lg text-gold" aria-hidden="true">✦</span>
            <input
              className="min-h-[54px] w-full bg-transparent text-base text-ink placeholder:text-muted focus:outline-none"
              placeholder="La Luna, 3 espadas, amor..."
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </label>
        <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1" aria-label="Filtros rapidos">
          {chips.map((chip) => (
            <Chip key={chip} onClick={() => setQuery(chip)}>
              {chip}
            </Chip>
          ))}
        </div>
      </section>

      {!query && <div className="space-y-4">
        <GlassCard className="relative overflow-hidden">
          <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-violet/10 blur-2xl" aria-hidden="true" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Estado inicial</p>
          <h2 className="mt-2 font-display text-3xl leading-tight text-ink">Busca en menos de 3 segundos</h2>
          <p className="mt-2 text-sm leading-6 text-muted">El indice local responde sin cuenta, sin backend y listo para usar offline cuando el contenido esta cacheado.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link className="inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-background" to="/carta/the_moon">Ver ejemplo</Link>
            <Link className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-surface/60 px-4 text-sm font-semibold text-gold" to="/cartas">Explorar cartas</Link>
          </div>
        </GlassCard>
        <div className="grid gap-3">
          <PremiumRow>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">Popular</p>
            <p className="mt-1 text-sm text-muted">La Luna, La Torre y El Sol suelen ser las consultas mas rapidas.</p>
          </PremiumRow>
          <PremiumRow>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">Sugerencia</p>
            <p className="mt-1 text-sm text-muted">Prueba una pregunta corta como amor, decision, trabajo o bloqueo.</p>
          </PremiumRow>
        </div>
      </div>}

      {query && loadState === "loading" && <GlassCard><StatePanel title="Preparando busqueda">Cargando el indice local para responder desde este dispositivo.</StatePanel></GlassCard>}
      {query && loadState === "error" && <GlassCard><StatePanel title="Indice no disponible">Modo offline: no pude cargar el indice todavia. Prueba otra vez cuando la app termine de cachear contenido.</StatePanel></GlassCard>}
      {query && loadState === "ready" && results.length === 0 && (
        <GlassCard>
          <StatePanel title="No encontre esa carta">
            Proba con nombre, numero romano o una palabra como amor, trabajo, miedo o consejo.
          </StatePanel>
        </GlassCard>
      )}
      {results.length > 0 && <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Resultados</p>
        {results.map((card, index) => (
          <GlassCard key={card.id} className={index === 0 ? "flex gap-4 p-4" : "flex gap-3 p-3"}>
            <TarotFrame className={index === 0 ? "h-32 w-[5.5rem] shrink-0" : "h-24 w-16 shrink-0"} src={card.thumbnail} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-2xl leading-tight text-ink">{card.nameEs}</h2>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">{card.roman ? `Arcano ${card.roman}` : card.suit ?? card.arcana}</p>
                </div>
                {index === 0 && <span className="rounded-full bg-gold/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">Mejor</span>}
              </div>
              <p className="mt-1 text-sm text-muted">{card.keywordsUpright.slice(0, 3).join(" · ")}</p>
              <p className="mt-2 text-sm leading-5 text-ink">Derecha: {card.oneLineUpright}</p>
              <p className="mt-1 text-sm leading-5 text-muted">Invertida: {card.oneLineReversed}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link className="inline-flex min-h-9 items-center rounded-full bg-gold px-3 text-xs font-semibold text-background" to={`/carta/${card.id}`}>Ver</Link>
                <ActionButton className="min-h-9 px-3 text-xs" onClick={() => void copyText(`${card.nameEs}: ${card.oneLineUpright}`)}>Copiar</ActionButton>
                <ActionButton className="min-h-9 px-3 text-xs" onClick={() => void runRecoverableStorageAction(() => saveFavorite(card.id))}>Guardar</ActionButton>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>}
    </div>
  );
}
