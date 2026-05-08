// src/pages/PlaylistDetail/PlaylistDetail.tsx
import { useParams } from 'react-router-dom';
import { fetchPlaylistTracks } from '../../services/api';
import { usePaginated } from '../../hooks/useApi';
import TrackList from '../../components/TrackList/TrackList';
import styles from './PlaylistDetail.module.scss';

const LIMIT = 20;

export default function PlaylistDetail() {
  // useParams reads the :id from the URL — /playlists/:id
  const { id } = useParams<{ id: string }>();

  const { data, loading, error, offset, next, prev } = usePaginated(
    (limit, off) => fetchPlaylistTracks(id!, limit, off),
    LIMIT
  );

  const page    = Math.floor(offset / LIMIT) + 1;
  const hasNext = !!data?.next;
  const hasPrev = offset > 0;
  const tracks  = data?.items ?? [];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => history.back()}>← Back</button>
        <div>
          <h1>Playlist Tracks</h1>
          {data && <p>{data.total} tracks · Page {page}</p>}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.skeletons}>
          {Array.from({ length: LIMIT }).map((_, i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : (
        <TrackList tracks={tracks} />
      )}

      <div className={styles.pagination}>
        <button onClick={prev} disabled={!hasPrev} className={styles.pageBtn}>← Prev</button>
        <span className={styles.pageNum}>Page {page}</span>
        <button onClick={next} disabled={!hasNext} className={styles.pageBtn}>Next →</button>
      </div>
    </div>
  );
}
