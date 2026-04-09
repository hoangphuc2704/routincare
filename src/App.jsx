import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { ChatProvider } from './contexts/ChatContext';
import Login from './page/customer/login/Login';
import LoginEmail from './page/customer/login/LoginEmail';
import SignUp from './page/customer/login/SignUp';
import Homepage from './page/customer/home/HomePage';
import NotificationPage from './page/customer/notification/NotificationPage.jsx';
import SelfRoutinePage from './page/customer/selfrRoutin/SelfRoutinePage';
import CreateRoutinePage from './page/customer/selfrRoutin/CreateRoutinePage';
import RoutineDetailPage from './page/customer/selfrRoutin/RoutineDetailPage';
import WorkoutPage from './page/customer/selfrRoutin/workout/WorkoutPage';
import Profile from './page/customer/profile/Profile';
import MessagePage from './page/customer/message/MessagePage';
import ChatDetail from './page/customer/message/ChatDetail';
import FriendRequests from './page/customer/friend/FriendRequests';
import SubscriptionPage from './page/customer/subscription/SubscriptionPage';
import PlanDetailPage from './page/customer/subscription/PlanDetailPage';
import UserSearchPage from './page/customer/user/UserSearchPage';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './page/admin/Dashboard';
import CategoryList from './page/admin/categories/CategoryList';
import UserList from './page/admin/users/UserList';

// Protected Route component for admin pages
function ProtectedAdminRoute({ element }) {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin =
    user?.roleName?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'admin';

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return element;
}

function App() {
  return (
    <ChatProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login-email" element={<LoginEmail />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/notification" element={<NotificationPage />} />
        <Route path="/customer/selfroutin" element={<SelfRoutinePage />} />
        <Route path="/customer/selfroutin/:id" element={<RoutineDetailPage />} />
        <Route path="/customer/selfroutin/create" element={<CreateRoutinePage />} />
        <Route path="/customer/selfroutin/workout" element={<WorkoutPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/customer/users/search" element={<UserSearchPage />} />
        <Route path="/customer/subscriptions" element={<SubscriptionPage />} />
        <Route path="/customer/subscriptions/:planId" element={<PlanDetailPage />} />
        <Route path="/payment/success" element={<SubscriptionPage />} />
        <Route path="/payment/cancel" element={<SubscriptionPage />} />
        <Route path="/payments/return" element={<SubscriptionPage />} />
        <Route path="/customer/message" element={<MessagePage />} />
        <Route path="/customer/message/:id" element={<ChatDetail />} />
        <Route path="/customer/friend/requests" element={<FriendRequests />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedAdminRoute element={<AdminLayout />} />}>
          <Route index element={<Dashboard />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="users" element={<UserList />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ChatProvider>
  );
}

export default App;
