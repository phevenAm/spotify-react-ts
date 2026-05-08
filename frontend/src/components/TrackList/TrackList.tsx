// src/components/TrackList/TrackList.tsx
import type { SpotifyApi } from '../../services/api';
import styles from './TrackList.module.scss';

interface Props {
  tracks: SpotifyApi.TrackItem[];
}

export default function TrackList({ tracks }: Props) {
  return (
    <div className={styles.list}>
      <div className={styles.header}>
        <span className={styles.num}>#</span>
        <span>Title</span>
        <span className={styles.album}>Album</span>
        <span className={styles.duration}>⏱</span>
      </div>
      <div className={styles.divider} />
      {tracks.map((item, i) => (
        <TrackRow key={item.track?.id ?? i} item={item} index={i + 1} />
      ))}
    </div>
  );
}

function TrackRow({ item, index }: { item: SpotifyApi.TrackItem; index: number }) {
  const { track } = item;
  if (!track) return null;

  const duration = formatDuration(track.duration_ms);
  const albumArt = track.album.images?.[2]?.url ?? track.album.images?.[0]?.url;

  return (
    <div className={styles.row}>
      <span className={styles.num}>{index}</span>
      <div className={styles.titleCell}>
        {albumArt && <img src={albumArt} alt={track.album.name} className={styles.thumb} />}
        <div>
          <p className={styles.trackName}>{track.name}</p>
          <p className={styles.artists}>{track.artists.map(a => a.name).join(', ')}</p>
        </div>
      </div>
      <span className={styles.album}>{track.album.name}</span>
      <span className={styles.duration}>{duration}</span>
    </div>
  );
}

function formatDuration(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
