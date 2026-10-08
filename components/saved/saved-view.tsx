"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { ArticleCard } from "@/components/news/article-card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import { listStagger } from "@/lib/motion";
import { STORAGE_KEYS } from "@/lib/storage/local";
import { useStoredState } from "@/lib/storage/use-stored";
import { savedStateSchema } from "@/lib/validation/schemas";
import type { Collection, SavedState } from "@/types";

const EMPTY: SavedState = { articles: [], collections: [] };

export function SavedView() {
  const reduce = useReducedMotion();
  const stagger = listStagger(Boolean(reduce));
  const [state, setState] = useStoredState(STORAGE_KEYS.saved, savedStateSchema, EMPTY);
  const [tab, setTab] = useState<"articles" | "collections">("articles");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [name, setName] = useState("");
  const [renameTarget, setRenameTarget] = useState<Collection | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [adderOpen, setAdderOpen] = useState(false);
  const [nameError, setNameError] = useState("");

  const active = state.collections.find((collection) => collection.id === activeId) ?? null;
  const articles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.articles.filter((article) => {
      const text = `${article.title} ${article.excerpt} ${article.source} ${article.tags.join(" ")}`.toLowerCase();
      return needle.length === 0 || text.includes(needle);
    });
  }, [query, state.articles]);

  const unsave = (id: string) => {
    setState((current) => ({
      articles: current.articles.filter((article) => article.id !== id),
      collections: current.collections.map((collection) => ({
        ...collection,
        articleIds: collection.articleIds.filter((articleId) => articleId !== id),
      })),
    }));
  };

  const createCollection = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setNameError("Give the collection a name of at least 2 characters.");
      return;
    }
    if (trimmed.length > 60) {
      setNameError("Keep the name under 60 characters.");
      return;
    }
    setState((current) => ({
      ...current,
      collections: [
        { id: crypto.randomUUID(), name: trimmed, articleIds: [], createdAt: new Date().toISOString() },
        ...current.collections,
      ],
    }));
    setName("");
    setNameError("");
    setCreatorOpen(false);
  };

  const rename = () => {
    if (!renameTarget) return;
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 60) {
      setNameError("Use 2–60 characters.");
      return;
    }
    setState((current) => ({
      ...current,
      collections: current.collections.map((collection) =>
        collection.id === renameTarget.id ? { ...collection, name: trimmed } : collection,
      ),
    }));
    setRenameTarget(null);
    setName("");
    setNameError("");
  };

  const toggleMembership = (collectionId: string, articleId: string) => {
    setState((current) => ({
      ...current,
      collections: current.collections.map((collection) => {
        if (collection.id !== collectionId) return collection;
        const has = collection.articleIds.includes(articleId);
        return {
          ...collection,
          articleIds: has
            ? collection.articleIds.filter((id) => id !== articleId)
            : [...collection.articleIds, articleId],
        };
      }),
    }));
  };

  const deleting = state.collections.find((collection) => collection.id === deleteId);

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Saved</h1>
        <p className="text-sm text-muted">{state.articles.length} saved</p>
      </div>

      <div role="tablist" aria-label="Saved sections" className="mt-4 flex gap-5 border-b border-white/10">
        {(
          [
            ["articles", "Articles"],
            ["collections", "Collections"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`saved-tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`saved-panel-${id}`}
            onClick={() => {
              setTab(id);
              setActiveId(null);
            }}
            className={cn(
              "min-h-11 border-b-2 px-1 text-sm",
              tab === id ? "border-primary text-foreground" : "border-transparent text-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "articles" ? (
        <div role="tabpanel" id="saved-panel-articles" aria-labelledby="saved-tab-articles" className="mt-4">
          <label className="block">
            <span className="sr-only">Search saved articles</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search saved articles..."
              className="min-h-11 w-full rounded-xl border border-white/10 bg-input px-3 text-sm"
            />
          </label>
          {state.articles.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-white/15 px-4 py-12 text-center">
              <p className="font-medium">Nothing saved yet</p>
              <p className="mt-2 text-sm text-muted">Use the bookmark on a For You story. It stays here after the feed refreshes.</p>
            </div>
          ) : articles.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No saved articles match that search.</p>
          ) : (
            <motion.div className="mt-4 space-y-3" variants={stagger.container} initial="hidden" animate="show">
              <AnimatePresence mode="popLayout" initial={false}>
                {articles.map((article) => (
                  <motion.div key={article.id} layout variants={stagger.item} initial="hidden" animate="show" exit="exit">
                    <ArticleCard article={article} saved onToggleSave={() => unsave(article.id)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      ) : (
        <div role="tabpanel" id="saved-panel-collections" aria-labelledby="saved-tab-collections" className="mt-4">
          {active ? (
            <CollectionDetail
              collection={active}
              articles={state.articles}
              onBack={() => setActiveId(null)}
              onRename={() => {
                setName(active.name);
                setNameError("");
                setRenameTarget(active);
              }}
              onAdd={() => setAdderOpen(true)}
              onRemove={(articleId) => toggleMembership(active.id, articleId)}
            />
          ) : (
            <>
              <Button type="button" onClick={() => { setName(""); setNameError(""); setCreatorOpen(true); }}>
                New collection
              </Button>
              {state.collections.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-white/15 px-4 py-12 text-center">
                  <p className="font-medium">No collections yet</p>
                  <p className="mt-2 text-sm text-muted">Group saved stories by asset, thesis, or market event.</p>
                </div>
              ) : (
                <motion.ul className="mt-4 space-y-3" variants={stagger.container} initial="hidden" animate="show">
                  <AnimatePresence mode="popLayout" initial={false}>
                  {state.collections.map((collection) => (
                    <motion.li
                      key={collection.id}
                      layout
                      variants={stagger.item}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="rounded-2xl border border-white/10 bg-panel p-4"
                    >
                      <button type="button" className="w-full text-left" onClick={() => setActiveId(collection.id)}>
                        <p className="font-medium">{collection.name}</p>
                        <p className="mt-1 text-sm text-muted">
                          {collection.articleIds.length} {collection.articleIds.length === 1 ? "article" : "articles"}
                        </p>
                      </button>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="min-h-11 rounded-full px-3 text-sm text-muted hover:bg-white/5 hover:text-foreground"
                          onClick={() => {
                            setName(collection.name);
                            setNameError("");
                            setRenameTarget(collection);
                          }}
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          className="min-h-11 rounded-full px-3 text-sm text-muted hover:bg-white/5 hover:text-foreground disabled:opacity-40"
                          disabled={collection.articleIds.length > 0}
                          onClick={() => setDeleteId(collection.id)}
                        >
                          {collection.articleIds.length > 0 ? "Empty it before deleting" : "Delete"}
                        </button>
                      </div>
                    </motion.li>
                  ))}
                  </AnimatePresence>
                </motion.ul>
              )}
            </>
          )}
        </div>
      )}

      <Dialog open={creatorOpen} onClose={() => setCreatorOpen(false)} title="New collection">
        <NameField name={name} setName={setName} error={nameError} onSubmit={createCollection} label="Create collection" />
      </Dialog>
      <Dialog open={Boolean(renameTarget)} onClose={() => setRenameTarget(null)} title="Rename collection">
        <NameField name={name} setName={setName} error={nameError} onSubmit={rename} label="Save name" />
      </Dialog>
      <Dialog open={adderOpen && Boolean(active)} onClose={() => setAdderOpen(false)} title="Add articles" wide>
        {state.articles.length === 0 ? (
          <p className="text-sm text-muted">Save an article from For You before adding it to a collection.</p>
        ) : (
          <ul className="space-y-2">
            {state.articles.map((article) => {
              const checked = active?.articleIds.includes(article.id) ?? false;
              return (
                <li key={article.id}>
                  <label className="flex min-h-11 items-start gap-3 rounded-xl border border-white/10 px-3 py-3 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checked}
                      onChange={() => active && toggleMembership(active.id, article.id)}
                    />
                    <span>
                      <span className="block font-medium">{article.title}</span>
                      <span className="text-muted">{article.source}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </Dialog>
      <ConfirmDialog
        open={Boolean(deleting)}
        title={deleting ? `Delete “${deleting.name}”?` : "Delete collection?"}
        body="Only an empty collection can be deleted. The articles themselves stay in Saved."
        confirmLabel="Delete collection"
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            setState((current) => ({
              ...current,
              collections: current.collections.filter((collection) => collection.id !== deleteId || collection.articleIds.length > 0),
            }));
          }
          setDeleteId(null);
        }}
      />
    </div>
  );
}

function NameField({
  name,
  setName,
  error,
  onSubmit,
  label,
}: {
  name: string;
  setName: (value: string) => void;
  error: string;
  onSubmit: () => void;
  label: string;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="block text-sm">
        <span className="text-muted">Name</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-input px-3"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "collection-name-error" : undefined}
        />
        {error ? (
          <span id="collection-name-error" className="mt-1 block text-negative">
            {error}
          </span>
        ) : null}
      </label>
      <Button type="submit" className="mt-4 w-full">
        {label}
      </Button>
    </form>
  );
}

function CollectionDetail({
  collection,
  articles,
  onBack,
  onRename,
  onAdd,
  onRemove,
}: {
  collection: Collection;
  articles: SavedState["articles"];
  onBack: () => void;
  onRename: () => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const stagger = listStagger(Boolean(reduce));
  const members = collection.articleIds
    .map((id) => articles.find((article) => article.id === id))
    .filter((article): article is SavedState["articles"][number] => Boolean(article));

  return (
    <div>
      <button type="button" onClick={onBack} className="min-h-11 text-sm text-muted hover:text-foreground">
        Back to collections
      </button>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">{collection.name}</h2>
        <div className="flex gap-2">
          <button type="button" onClick={onRename} className="min-h-11 rounded-full px-3 text-sm text-muted hover:bg-white/5">
            Rename
          </button>
          <Button type="button" onClick={onAdd}>
            Add articles
          </Button>
        </div>
      </div>
      {members.length === 0 ? (
        <p className="mt-4 text-sm text-muted">This collection is empty. Add saved articles, or delete it from the list.</p>
      ) : (
        <motion.ul className="mt-4 space-y-3" variants={stagger.container} initial="hidden" animate="show">
          <AnimatePresence mode="popLayout" initial={false}>
          {members.map((article) => (
            <motion.li
              key={article.id}
              layout
              variants={stagger.item}
              initial="hidden"
              animate="show"
              exit="exit"
              className="rounded-2xl border border-white/10 bg-panel p-4"
            >
              <p className="text-sm text-muted">{article.source}</p>
              <p className="mt-2 font-medium">{article.title}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm text-[#c4b5fd]"
                >
                  Open original
                </a>
                <button
                  type="button"
                  onClick={() => onRemove(article.id)}
                  className="min-h-11 rounded-full px-3 text-sm text-muted hover:text-foreground"
                >
                  Remove from collection
                </button>
              </div>
            </motion.li>
          ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}
