import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAccessToken } from '../../../utils/tokenService';

export default function AuthGuard({ children, redirectTo = '/' }) {
  const token = getAccessToken();
  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
}
