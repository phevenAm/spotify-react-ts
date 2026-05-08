// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import MoodSelector from './pages/MoodSelector/MoodSelector';
import Playlists from './pages/Playlists/Playlists';
import PlaylistDetail from './pages/PlaylistDetail/PlaylistDetail';
import Search from './pages/Search/Search';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/"              element={<Home />} />
          <Route path="/mood"          element={<MoodSelector />} />
          <Route path="/playlists"     element={<Playlists />} />
          <Route path="/playlists/:id" element={<PlaylistDetail />} />
          <Route path="/search"        element={<Search />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
