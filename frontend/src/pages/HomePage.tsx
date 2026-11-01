import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRoomList } from '../api';
import type { Room } from '../types';
import HomeHero from '../components/HomeHero';
import HomeFeatured from '../components/HomeFeatured';
import HomeCategories from '../components/HomeCategories';
import HomeAbout from '../components/HomeAbout';
import HomeCta from '../components/HomeCta';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getRoomList();
        if (active) setRooms(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="ds-stack-lg">
      <HomeHero imageUrl="/img/brand/hero.jpg" />
      <HomeFeatured rooms={rooms} loading={loading} />
      <HomeCategories />
      <HomeAbout />
      <HomeCta isAuthenticated={isAuthenticated} />
    </div>
  );
}