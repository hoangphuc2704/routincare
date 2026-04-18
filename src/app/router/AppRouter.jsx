import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../../pages/Login';
import LoginEmail from '../../pages/customer/login/LoginEmail';
import SignUp from '../../pages/customer/login/SignUp';
import Homepage from '../../pages/customer/home/HomePage';
import SelfRoutinePage from '../../pages/customer/selfRoutine/SelfRoutinePage';
import CreateRoutinePage from '../../pages/customer/selfRoutine/CreateRoutinePage';
import RoutineDetailPage from '../../pages/customer/selfRoutine/RoutineDetailPage';
import WorkoutPage from '../../pages/customer/selfRoutine/workout/WorkoutPage';
import Profile from '../../pages/customer/profile/Profile';
import MessagePage from '../../pages/customer/message/MessagePage';
import ChatDetail from '../../pages/customer/message/ChatDetail';
import FriendRequests from '../../pages/customer/friend/FriendRequests';
import FriendsList from '../../pages/customer/friend/FriendsList';
import SubscriptionPage from '../../pages/customer/subscription/SubscriptionPage';
import PlanDetailPage from '../../pages/customer/subscription/PlanDetailPage';
import UserSearchPage from '../../pages/customer/user/UserSearchPage';
import AdminLayout from '../../layouts/AdminLayout';
import Dashboard from '../../pages/admin/Dashboard';
import CategoryList from '../../pages/admin/categories/CategoryList';
import UserList from '../../pages/admin/users/UserList';
import RevenueDashboardPage from '../../pages/admin/revenue/RevenueDashboardPage';

function ProtectedAdminRoute({ element }) {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin =
    user?.roleName?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'admin';

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return element;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login-email" element={<LoginEmail />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/home" element={<Homepage />} />
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
      <Route path="/customer/friend/list" element={<FriendsList />} />

      <Route path="/admin" element={<ProtectedAdminRoute element={<AdminLayout />} />}>
        <Route index element={<Dashboard />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="users" element={<UserList />} />
        <Route path="revenue" element={<RevenueDashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
