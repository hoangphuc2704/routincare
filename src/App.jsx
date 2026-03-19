import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
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
import SubscriptionPage from './page/customer/subscription/SubscriptionPage';
import PlanDetailPage from './page/customer/subscription/PlanDetailPage';
import UserSearchPage from './page/customer/user/UserSearchPage';
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login-email" element={<LoginEmail />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/home" element={<Homepage />} />
      <Route path="/notification" element={<NotificationPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/customer/selfroutin" element={<SelfRoutinePage />} />
      <Route path="/customer/selfroutin/:id" element={<RoutineDetailPage />} />
      <Route path="/customer/selfroutin/create" element={<CreateRoutinePage />} />
      <Route path="/customer/selfroutin/workout" element={<WorkoutPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/:userId" element={<Profile />} />
      <Route path="/customer/users/search" element={<UserSearchPage />} />
      <Route path="/customer/subscriptions" element={<SubscriptionPage />} />
      <Route path="/customer/subscriptions/:planId" element={<PlanDetailPage />} />
      <Route path="/customer/message" element={<MessagePage />} />
      <Route path="/customer/message/:id" element={<ChatDetail />} />
    </Routes>
  );
}

export default App;
