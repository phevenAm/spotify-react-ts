// src/components/PlaylistCard/PlaylistCard.tsx
import { useNavigate } from 'react-router-dom';
import type { SpotifyApi } from '../../services/api';
import styles from './PlaylistCard.module.scss';

interface Props {
  playlist: SpotifyApi.Playlist;
}

export default function PlaylistCard({ playlist }: Props) {
  const navigate = useNavigate();
  const image = playlist.images?.[0]?.url;

  return (
    <article
      className={styles.card}
      onClick={() => navigate(`/playlists/${playlist.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/playlists/${playlist.id}`)}
    >
      <div className={styles.image}>
        {image
          ? <img src={image} alt={playlist.name} loading="lazy" />
          : <div className={styles.placeholder}><MusicIcon /></div>
        }
        <div className={styles.overlay}>
          <PlayButton />
        </div>
      </div>
      <div className={styles.info}>
        <p className={styles.name}>{playlist.name}</p>
        <p className={styles.meta}>
          {playlist.tracks.total} tracks · {playlist.owner.display_name}
        </p>
      </div>
    </article>
  );
}

function PlayButton() {
  return (
    <div className={styles.playBtn}>
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  );
}

function MusicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  );
}
