import React from 'react';
import { ChatProvider } from '../../contexts/ChatContext';

export default function AppProviders({ children }) {
  return <ChatProvider>{children}</ChatProvider>;
}
