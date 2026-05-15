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

const searchLimit = 10;

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const type = (searchParams.get("type") ?? "track") as SearchType;
  const offset = Number(searchParams.get("offset") ?? 0);

  const [input, setInput] = useState(query);

  const [data, setData] = useState<SpotifyApi.SearchResponse | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || !type) {
      return;
    }

    let cancelled = false; //!cleanup

    async function runSearch() {
      setLoading(true);
      setError(null);
      try {
        const result = await searchSpotify(query, type, searchLimit, offset);

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Search failed");
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

    setSearchParams({
      q: trimmed,
      type,
      offset: "0",
    });
  }

  const tracks = data?.tracks?.items ?? [];
  const playlists = data?.playlists?.items ?? [];

  const results =
    type === "track" ? tracks.filter(Boolean) : playlists.filter(Boolean);

  const total =
    type === "track"
      ? (data?.tracks?.total ?? 0)
      : (data?.playlists?.total ?? 0);

  const hasNext =
    type === "track"
      ? Boolean(data?.tracks?.next)
      : Boolean(data?.playlists?.next);

  const hasPrev = offset > 0;

  const page = Math.floor(offset / searchLimit) + 1;

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
          onChange={(e) => {
            setSearchParams({
              q: query,
              type: e.target.value as SearchType,
              offset: "0",
            });
          }}
          className={styles.selectType}
        >
          <option value="track">Songs</option>
          <option value="playlist">Playlists</option>
        </select>

        <button onClick={handleSearch} className={styles.searchBtn}>
          Search
        </button>
      </div>

      {!query && <p className={styles.resultMeta}>Enter a search term.</p>}

      {query && (
        <p className={styles.resultMeta}>
          {loading ? "Searching..." : `${total} results`}
        </p>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {!loading && type === "playlist" && results.length > 0 && (
        <div className={styles.grid}>
          {playlists.filter(Boolean).map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}

      {!loading && type === "track" && results.length > 0 && (
        <div className={styles.trackList}>
          {tracks.map((track) => (
            <div key={track.id} className={styles.trackRow}>
              <img
                src={track.album.images?.[0]?.url}
                alt={track.name}
                className={styles.trackImage}
              />

              <div>
                <p>{track.name}</p>

                <p>{track.artists.map((artist) => artist.name).join(", ")}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className={styles.pagination}>
          <button
            onClick={() =>
              setSearchParams({
                q: query,
                type,
                offset: String(Math.max(offset - searchLimit, 0)),
              })
            }
            disabled={!hasPrev}
            className={styles.pageBtn}
          >
            ← Prev
          </button>

          <span className={styles.pageNum}>Page {page}</span>

          <button
            onClick={() =>
              setSearchParams({
                q: query,
                type,
                offset: String(offset + searchLimit),
              })
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
