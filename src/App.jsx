import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './page/customer/login/Login';
import LoginEmail from './page/customer/login/LoginEmail';
import SignUp from './page/customer/login/SignUp';
import Homepage from './page/customer/home/HomePage';
import NotificationPage from './page/customer/notification/NotificationPage.jsx';
import SelfRoutinePage from './page/customer/selfrRoutin/SelfRoutinePage';
import WorkoutPage from './page/customer/selfrRoutin/workout/WorkoutPage';
import MyFeedsPage from './page/customer/myfeeds/MyFeedsPage';
import MyFeedsSavedPage from './page/customer/myfeeds/saved/MyFeedsSavedPage';
import MyFeedsGridPage from './page/customer/myfeeds/grid/MyFeedsGridPage';
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
            <Route path="/customer/selfroutin/workout" element={<WorkoutPage />} />
            <Route path="/customer/myfeeds" element={<MyFeedsPage />} />
            <Route path="/customer/myfeeds/saved" element={<MyFeedsSavedPage />} />
            <Route path="/customer/myfeeds/grid" element={<MyFeedsGridPage />} />
        </Routes>
    );
}

export default App;
