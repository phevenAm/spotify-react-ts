export type Track = {
  id: string;
  name: string;
  artistName?: string;
  imageUrl?: string;
};

export type ApiError = {
  message: string;
};

export type SearchResponse = {
  tracks?: {
    items: Track[];
  };
};
