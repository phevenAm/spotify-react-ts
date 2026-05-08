// src/pages/Search/Search.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchPlaylists } from '../../services/api';
import { usePaginated } from '../../hooks/useApi';
import PlaylistCard from '../../components/PlaylistCard/PlaylistCard';
import styles from './Search.module.scss';

const LIMIT = 20;

export default function Search() {
  // useSearchParams lets us read ?q=... and ?mood=... from the URL.
  // The MoodSelector page navigates here with those params pre-filled.
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState(searchParams.get('q') ?? '');
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  const { data, loading, error, offset, next, prev, reset } = usePaginated(
    (limit, off) => searchPlaylists(query, limit, off),
    LIMIT
  );

  // When the mood page sends us here with a pre-filled query, run it immediately
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setInput(q); setQuery(q); }
  }, []);

  function handleSearch() {
    if (!input.trim()) return;
    setQuery(input.trim());
    setSearchParams({ q: input.trim() });
    reset();
  }

  const page    = Math.floor(offset / LIMIT) + 1;
  const hasNext = !!data?.playlists?.next;
  const hasPrev = offset > 0;
  const results = data?.playlists?.items ?? [];
  const total   = data?.playlists?.total ?? 0;

  return (
    <div className={styles.page}>
      <h1>Search</h1>

      <div className={styles.searchBar}>
        <input
          type="text"
          value={input}
          placeholder="Search playlists…"
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className={styles.input}
        />
        <button onClick={handleSearch} className={styles.searchBtn}>
          Search
        </button>
      </div>

      {query && (
        <p className={styles.resultMeta}>
          {loading ? 'Searching…' : `${total} results for "${query}"`}
        </p>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {!loading && results.length > 0 && (
        <>
          <div className={styles.grid}>
            {results.map(playlist => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>

          <div className={styles.pagination}>
            <button onClick={prev} disabled={!hasPrev} className={styles.pageBtn}>← Prev</button>
            <span className={styles.pageNum}>Page {page}</span>
            <button onClick={next} disabled={!hasNext} className={styles.pageBtn}>Next →</button>
          </div>
        </>
      )}
    </div>
  );
}
