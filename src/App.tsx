import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAppStore } from './store';
import { useCurrentUser } from './hooks/useCurrentUser';
import { TopBar } from './components/TopBar';
import { DemoControls } from './components/DemoControls';
import { ToastHost } from './components/ToastHost';

// Screens
import { PortalGateway } from './screens/PortalGateway';
import { DonorAuth } from './screens/DonorAuth';
import { ReceiverAuth } from './screens/ReceiverAuth';
import { DonorHome } from './screens/DonorHome';
import { ReceiverFeed } from './screens/ReceiverFeed';
import { PostFood } from './screens/PostFood';
import { DonorPostDetail } from './screens/DonorPostDetail';
import { FoodDetail } from './screens/FoodDetail';
import { OrderScreen } from './screens/OrderScreen';
import { MyOrders } from './screens/MyOrders';
import { Notifications } from './screens/Notifications';
import { Dashboard } from './screens/Dashboard';

// Donor Portal Entry Guard
const DonorPortalRouter: React.FC = () => {
  const { currentUser, isDonor } = useCurrentUser();
  if (!currentUser || !isDonor) {
    return <DonorAuth />;
  }
  return <DonorHome />;
};

// Receiver Portal Entry Guard
const ReceiverPortalRouter: React.FC = () => {
  const { currentUser, isReceiver } = useCurrentUser();
  if (!currentUser || !isReceiver) {
    return <ReceiverAuth />;
  }
  return <ReceiverFeed />;
};

// Generic Post Detail Router
const PostDetailRouter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useCurrentUser();
  const posts = useAppStore((s) => s.posts);

  const post = posts.find((p) => p.id === id);
  if (!post) return <Navigate to="/" replace />;

  if (currentUser && post.donorId === currentUser.id) {
    return <DonorPostDetail />;
  }
  return <FoodDetail />;
};

export const App: React.FC = () => {
  const runExpiryCheck = useAppStore((s) => s.runExpiryCheck);

  // 1-second expiry tick
  useEffect(() => {
    runExpiryCheck();
    const timer = setInterval(() => {
      runExpiryCheck();
    }, 1000);
    return () => clearInterval(timer);
  }, [runExpiryCheck]);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <TopBar />

        <main className="flex-1 pb-16">
          <Routes>
            {/* Gateway */}
            <Route path="/" element={<PortalGateway />} />

            {/* DONOR WEBSITE ROUTES */}
            <Route path="/donor" element={<DonorPortalRouter />} />
            <Route path="/donor/login" element={<DonorAuth />} />
            <Route path="/donor/post/new" element={<PostFood />} />
            <Route path="/donor/post/:id" element={<DonorPostDetail />} />
            <Route path="/donor/orders" element={<MyOrders />} />
            <Route path="/donor/order/:id" element={<OrderScreen />} />
            <Route path="/donor/notifications" element={<Notifications />} />

            {/* RECIPIENT WEBSITE ROUTES */}
            <Route path="/receiver" element={<ReceiverPortalRouter />} />
            <Route path="/receiver/login" element={<ReceiverAuth />} />
            <Route path="/receiver/post/:id" element={<FoodDetail />} />
            <Route path="/receiver/orders" element={<MyOrders />} />
            <Route path="/receiver/order/:id" element={<OrderScreen />} />
            <Route path="/receiver/notifications" element={<Notifications />} />
            <Route path="/receiver/dashboard" element={<Dashboard />} />

            {/* SHARED / DIRECT ROUTES */}
            <Route path="/post/new" element={<PostFood />} />
            <Route path="/post/:id" element={<PostDetailRouter />} />
            <Route path="/order/:id" element={<OrderScreen />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <ToastHost />
        <DemoControls />
      </div>
    </HashRouter>
  );
};

export default App;
