// src/pages/MoodSelector/MoodSelector.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MoodCard, { type Mood } from '../../components/MoodCard/MoodCard';
import styles from './MoodSelector.module.scss';

// These map moods to Spotify search queries.
// YOU will wire these up to the /search API endpoint.
export const MOODS: Mood[] = [
  { id: 'calm',      label: 'Calm',      emoji: '😌', query: 'calm relaxing chill',     colour: '#4a90d9' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡', query: 'energetic workout pump',  colour: '#f5a623' },
  { id: 'romantic',  label: 'Romantic',  emoji: '💕', query: 'romantic love songs',     colour: '#e91e8c' },
  { id: 'focused',   label: 'Focused',   emoji: '🎯', query: 'focus study concentration', colour: '#7c4dff' },
  { id: 'angry',     label: 'Angry',     emoji: '🔥', query: 'angry aggressive metal',  colour: '#f44336' },
  { id: 'happy',     label: 'Happy',     emoji: '😄', query: 'happy feel good upbeat',  colour: '#1db954' },
  { id: 'sad',       label: 'Sad',       emoji: '😢', query: 'sad melancholy heartbreak', colour: '#90a4ae' },
  { id: 'party',     label: 'Party',     emoji: '🎉', query: 'party dance hits',        colour: '#ff6b35' },
];

export default function MoodSelector() {
  const [selected, setSelected] = useState<Mood | null>(null);
  const navigate = useNavigate();

  function handleMoodClick(mood: Mood) {
    setSelected(mood);
  }

  function handleGo() {
    if (!selected) return;
    // Navigate to the search page with the mood's query pre-filled.
    // URLSearchParams encodes the query safely for the URL.
    navigate(`/search?q=${encodeURIComponent(selected.query)}&mood=${selected.id}`);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>How are you feeling?</h1>
        <p>Pick a mood and we'll find the perfect playlist.</p>
      </div>

      <div className={styles.grid}>
        {MOODS.map(mood => (
          <MoodCard
            key={mood.id}
            mood={mood}
            selected={selected?.id === mood.id}
            onClick={handleMoodClick}
          />
        ))}
      </div>

      {selected && (
        <div className={styles.cta}>
          <p>Finding <strong>{selected.label}</strong> playlists…</p>
          <button className={styles.goBtn} onClick={handleGo}>
            Find Playlists →
          </button>
        </div>
      )}
    </div>
  );
}
