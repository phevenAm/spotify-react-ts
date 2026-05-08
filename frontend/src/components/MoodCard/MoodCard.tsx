// src/components/MoodCard/MoodCard.tsx
import styles from './MoodCard.module.scss';

export interface Mood {
  id: string;
  label: string;
  emoji: string;
  query: string;    // search term sent to Spotify
  colour: string;   // CSS custom property value
}

interface Props {
  mood: Mood;
  selected: boolean;
  onClick: (mood: Mood) => void;
}

export default function MoodCard({ mood, selected, onClick }: Props) {
  return (
    <button
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      style={{ '--mood-colour': mood.colour } as React.CSSProperties}
      onClick={() => onClick(mood)}
    >
      <span className={styles.emoji}>{mood.emoji}</span>
      <span className={styles.label}>{mood.label}</span>
    </button>
  );
}
