// src/pages/Home/Home.tsx
import { useApi } from '../../hooks/useApi';
import { fetchUser } from '../../services/api';
import styles from './Home.module.scss';

export default function Home() {
  const { data: user, loading, error } = useApi(fetchUser);

  if (loading) return <div className={styles.loading}>Loading…</div>;
  if (error)   return <div className={styles.error}>Not logged in — <a href="http://localhost:3000/login">log in with Spotify</a></div>;

  const avatar = user?.images?.[0]?.url;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        {avatar
          ? <img src={avatar} alt={user?.display_name} className={styles.avatar} />
          : <div className={styles.avatarPlaceholder}>{user?.display_name?.[0]}</div>
        }
        <div>
          <p className={styles.greeting}>Good to see you,</p>
          <h1 className={styles.name}>{user?.display_name}</h1>
          <p className={styles.meta}>{user?.followers?.total} followers · {user?.product} plan</p>
        </div>
      </div>

      <div className={styles.quickLinks}>
        <QuickLink href="/mood"      emoji="🎭" label="Pick a Mood"      desc="Find music for how you feel" />
        <QuickLink href="/playlists" emoji="🎵" label="My Playlists"     desc="Browse your saved playlists" />
        <QuickLink href="/search"    emoji="🔍" label="Search"           desc="Find any playlist on Spotify" />
      </div>
    </div>
  );
}

function QuickLink({ href, emoji, label, desc }: { href: string; emoji: string; label: string; desc: string }) {
  return (
    <a href={href} className={styles.quickLink}>
      <span className={styles.qlEmoji}>{emoji}</span>
      <div>
        <p className={styles.qlLabel}>{label}</p>
        <p className={styles.qlDesc}>{desc}</p>
      </div>
    </a>
  );
}
