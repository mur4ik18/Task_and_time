import { useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Sidebar from './Sidebar';
import Header from './Header';
import { wsService } from '../services/websocket';

export default function Layout() {
  const { isAuthenticated } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // Connect WebSocket
    wsService.connect(token);

    return () => {
      wsService.disconnect();
    };
  }, [navigate]);

  if (!isAuthenticated && !localStorage.getItem('accessToken')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

