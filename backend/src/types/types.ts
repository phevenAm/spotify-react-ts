interface userTokenObject{
    access_token: string;
    refresh_token: string;
}

export type { userTokenObject };

export type SearchType =
  | 'album'
  | 'artist'
  | 'playlist'
  | 'track'
  | 'show'
  | 'episode'
  | 'audiobook';