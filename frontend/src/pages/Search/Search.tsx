// src/pages/Search/Search.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  searchSpotify,
  type SearchType,
  type SpotifyApi,
} from "../../services/api";

import PlaylistCard from "../../components/PlaylistCard/PlaylistCard";

import styles from "./Search.module.scss";

const LIMIT = 20;

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get("q") ?? "";

  const [input, setInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);

  const [type, setType] = useState<SearchType>("track");

  const [data, setData] =
    useState<SpotifyApi.SearchResponse | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) return;

    let cancelled = false;

    async function runSearch() {
      setLoading(true);
      setError(null);

      try {
        const result = await searchSpotify(
          trimmed,
          type,
          LIMIT,
          offset,
        );

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Search failed",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    runSearch();

    return () => {
      cancelled = true;
    };
  }, [query, type, offset]);

  function handleSearch() {
    const trimmed = input.trim();

    if (!trimmed) return;

    setOffset(0);

    setQuery(trimmed);

    setSearchParams({
      q: trimmed,
    });
  }

const tracks = (data?.tracks?.items ?? []) as SpotifyApi.TrackItem[];
  const playlists = data?.playlists?.items ?? [];

  const results =
    type === "track"
      ? tracks.filter(Boolean)
      : playlists.filter(Boolean);

  const total =
    type === "track"
      ? data?.tracks?.total ?? 0
      : data?.playlists?.total ?? 0;

  const hasNext =
    type === "track"
      ? Boolean(data?.tracks?.next)
      : Boolean(data?.playlists?.next);

  const hasPrev = offset > 0;

  const page = Math.floor(offset / LIMIT) + 1;

  return (
    <div className={styles.page}>
      <h1>Search</h1>

      <div className={styles.searchBar}>
        <input
          type="text"
          value={input}
          placeholder="Search Spotify..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className={styles.input}
        />

        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value as SearchType)
          }
          className={styles.selectType}
        >
          <option value="track">Songs</option>
          <option value="playlist">Playlists</option>
        </select>

        <button
          onClick={handleSearch}
          className={styles.searchBtn}
        >
          Search
        </button>
      </div>

      {!query && (
        <p className={styles.resultMeta}>
          Enter a search term.
        </p>
      )}

      {query && (
        <p className={styles.resultMeta}>
          {loading
            ? "Searching..."
            : `${total} results`}
        </p>
      )}

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {!loading &&
        type === "playlist" &&
        results.length > 0 && (
          <div className={styles.grid}>
{playlists.filter(Boolean).map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
              />
            ))}
          </div>
        )}

      {!loading &&
        type === "track" &&
        results.length > 0 && (
          <div className={styles.trackList}>
            {tracks.map((track) => (
              <div
                key={track.id}
                className={styles.trackRow}
              >
                <img
                  src={track.album.images?.[0]?.url}
                  alt={track.name}
                  className={styles.trackImage}
                />

                <div>
                  <p>{track.name}</p>

                  <p>
                    {track.artists
                      .map((artist) => artist.name)
                      .join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      {!loading && results.length > 0 && (
        <div className={styles.pagination}>
          <button
            onClick={() =>
              setOffset((prev) =>
                Math.max(prev - LIMIT, 0),
              )
            }
            disabled={!hasPrev}
            className={styles.pageBtn}
          >
            ← Prev
          </button>

          <span className={styles.pageNum}>
            Page {page}
          </span>

          <button
            onClick={() =>
              setOffset((prev) => prev + LIMIT)
            }
            disabled={!hasNext}
            className={styles.pageBtn}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}