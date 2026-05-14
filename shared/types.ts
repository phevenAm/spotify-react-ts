
export namespace SpotifyApi {

  export interface UserProfile {
    id: string;
    display_name: string;
    email: string;
    images: Image[];
    followers: { total: number };
    country: string;
    product: string;
  }

  export interface Image {
    url: string;
    height: number;
    width: number;
  }

  export interface PlaylistPage {
    items: Playlist[];
    total: number;
    limit: number;
    offset: number;
    next: string | null;
    previous: string | null;
  }

  export interface Playlist {
    id: string;
    name: string;
    description: string;
    images: Image[];
    tracks: { total: number; href: string };
    owner: { display_name: string; id: string };
    public: boolean;
    uri: string;
    external_urls: { spotify: string };
  }

  export interface SearchResponse {
    playlists?: PlaylistPage;
    tracks?: TrackPage;
  }

  export interface TrackPage {
    items: TrackItem[];
    total: number;
    limit: number;
    offset: number;
    next: string | null;
    previous: string | null;
  }

  export interface TrackItem {
    track: Track;
    added_at: string;
     id: string;
  name: string;

  album: {
    images: {
      url: string;
    }[];
  };

  artists: {
    name: string;
  }[];
  }

  export interface Track {
    id: string;
    name: string;
    duration_ms: number;
    artists: Artist[];
    album: Album;
    explicit: boolean;
    uri: string;
    external_urls: { spotify: string };
  }

  export interface Artist {
    id: string;
    name: string;
  }

  export interface Album {
    id: string;
    name: string;
    images: Image[];
    release_date: string;
  }
}
