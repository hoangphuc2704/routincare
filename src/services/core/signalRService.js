import * as signalR from '@microsoft/signalr';
import { getAccessToken } from '../../utils/tokenService';

class SignalRService {
  constructor() {
    this.connection = null;
    this.listeners = new Map();
    this._startPromise = null;
  }

  connect() {
    if (this.connection && this.connection.state !== signalR.HubConnectionState.Disconnected) {
      console.log('✅ SignalR already connected/connecting');
      return this._startPromise || Promise.resolve();
    }

    const baseUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URLL || '';
    const hubUrl = `${baseUrl}/hubs/chat`;

    console.log('🔌 Connecting to SignalR Hub:', hubUrl);

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => getAccessToken(),
        // Skip HTTP negotiate to avoid CORS issue with AllowAnyOrigin backend
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 1000, 3000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.onreconnecting((error) => {
      console.warn('🔄 SignalR reconnecting...', error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('✅ SignalR reconnected:', connectionId);
    });

    this.connection.onclose((error) => {
      console.log('❌ SignalR connection closed:', error);
    });

    // Re-attach existing listeners to new connection
    for (const [event, callbacks] of this.listeners.entries()) {
      callbacks.forEach((cb) => this.connection.on(event, cb));
    }

    this._startPromise = this.connection
      .start()
      .then(() => console.log('✅ SignalR connected! ID:', this.connection.connectionId))
      .catch((err) => {
        console.error('🔴 SignalR connection error:', err);
        this._startPromise = null;
        throw err;
      });

    return this._startPromise;
  }

  disconnect() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
      this._startPromise = null;
      this.listeners.clear();
    }
  }

  async joinConversation(conversationId) {
    if (!this.connection) {
      console.warn('⚠️ SignalR not initialized');
      return;
    }

    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      console.warn(`⏳ SignalR not connected yet (state: ${this.connection.state}), waiting...`);
      // Wait for connection if connecting
      if (this.connection.state === signalR.HubConnectionState.Connecting) {
        await this._startPromise;
      } else {
        // Try to connect
        await this.connect();
      }
    }

    console.log(`📤 Invoking JoinConversation for: ${conversationId}`);
    await this.connection.invoke('JoinConversation', conversationId);
  }

  async leaveConversation(conversationId) {
    if (!this.connection) {
      console.warn('⚠️ SignalR not initialized');
      return;
    }

    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      console.warn(`⏳ SignalR not available (state: ${this.connection.state})`);
      return;
    }

    console.log(`📤 Invoking LeaveConversation for: ${conversationId}`);
    await this.connection.invoke('LeaveConversation', conversationId);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(callback);
    if (this.connection) this.connection.on(event, callback);
  }

  off(event, callback) {
    if (this.connection) this.connection.off(event, callback);
    if (this.listeners.has(event)) {
      const cbs = this.listeners.get(event);
      const i = cbs.indexOf(callback);
      if (i > -1) cbs.splice(i, 1);
    }
  }

  removeAllListeners(event) {
    if (this.connection) this.connection.off(event);
    this.listeners.delete(event);
  }

  isConnected() {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

const signalRService = new SignalRService();
export default signalRService;
