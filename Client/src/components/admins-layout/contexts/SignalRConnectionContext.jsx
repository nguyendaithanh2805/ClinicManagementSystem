import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './AuthContext'; 

const ConnectionContext = createContext(null);

export const useSignalRConnection = () => useContext(ConnectionContext);

export const SignalRConnectionProvider = ({ children }) => {
    const { user } = useAuth();
    const connectionRef = useRef(null);
    const [connectionState, setConnectionState] = useState('Disconnected');

    const startConnection = useCallback(async () => {
        if (!user?.token || connectionRef.current) return;

        const API_BASE_URL = import.meta.env.VITE_API_URL;
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_BASE_URL}/chatHub`, {
                accessTokenFactory: () => user?.token
            })
            .withAutomaticReconnect()
            .build();

        newConnection.onreconnecting(() => setConnectionState('Reconnecting'));
        newConnection.onreconnected(() => setConnectionState('Connected'));
        newConnection.onclose(() => setConnectionState('Disconnected'));

        try {
            await newConnection.start();
            connectionRef.current = newConnection;
            setConnectionState('Connected');
            console.log("Single SignalR Connection Established.");
        } catch (err) {
            console.error("SignalR Connection Error:", err);
            setConnectionState('Disconnected');
            setTimeout(startConnection, 5000); 
        }
    }, [user]);

    useEffect(() => {
        startConnection();
        
        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop();
                connectionRef.current = null;
            }
        };
    }, [startConnection]);

    const value = {
        connection: connectionRef.current,
        connectionState,
        // Dùng hàm này để đăng ký listener từ các Provider khác
        on: (methodName, newMethod) => connectionRef.current?.on(methodName, newMethod),
        off: (methodName) => connectionRef.current?.off(methodName),
        invoke: (methodName, ...args) => connectionRef.current?.invoke(methodName, ...args),
    };

    return (
        <ConnectionContext.Provider value={value}>
            {children}
        </ConnectionContext.Provider>
    );
};