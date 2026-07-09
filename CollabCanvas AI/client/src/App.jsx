import { useEffect, useState } from 'react';
import LoadingScreen from './components/LoadingScreen.jsx';
import Home from './pages/Home.jsx';
import Room from './pages/Room.jsx';

function routeFromLocation() {
  const match = window.location.pathname.match(/^\/room\/([^/]+)$/);
  return match ? { name: 'room', roomId: decodeURIComponent(match[1]) } : { name: 'home' };
}

export default function App() {
  const [route, setRoute] = useState(routeFromLocation);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 650);
    const onPop = () => setRoute(routeFromLocation());
    window.addEventListener('popstate', onPop);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  function navigate(path) {
    window.history.pushState({}, '', path);
    setRoute(routeFromLocation());
  }

  if (loading) return <LoadingScreen />;

  return route.name === 'room' ? <Room roomId={route.roomId} navigate={navigate} /> : <Home navigate={navigate} />;
}
