// src/pages/Playlists/Playlists.tsx
import { usePaginated } from '../../hooks/useApi';
import { fetchMyPlaylists } from '../../services/api';
import PlaylistCard from '../../components/PlaylistCard/PlaylistCard';
import styles from './Playlists.module.scss';

const LIMIT = 20;

export default function Playlists() {
  // usePaginated handles limit/offset state and next/prev for you.
  // YOUR TASK: understand what's happening here, then try calling
  // fetchMyPlaylists manually with different limit/offset values
  // in the browser console to see pagination in action.
  const { data, loading, error, offset, next, prev } = usePaginated(fetchMyPlaylists, LIMIT);

  const page    = Math.floor(offset / LIMIT) + 1;
  const hasNext = !!data?.next;
  const hasPrev = offset > 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>My Playlists</h1>
        {data && <p>{data.total} playlists total</p>}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : (
        <div className={styles.grid}>
          {data?.items.map(playlist => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}

      <div className={styles.pagination}>
        <button onClick={prev} disabled={!hasPrev} className={styles.pageBtn}>
          ← Prev
        </button>
        <span className={styles.pageNum}>Page {page}</span>
        <button onClick={next} disabled={!hasNext} className={styles.pageBtn}>
          Next →
        </button>
      </div>
    </div>
  );
}
