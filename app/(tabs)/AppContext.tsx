import React, { createContext, ReactNode, useContext, useState } from 'react';

interface AppContextType {
    backendUrl: string;
    setBackendUrl: (url: string) => void;
    userId: number | null;
    setUserId: (id: number | null) => void;
    email: string | null; // නව තත්වය
    setEmail: (email: string | null) => void; // නව ශ්‍රිතය
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [backendUrl, setBackendUrl] = useState<string>('http://192.168.43.114:3000');
    const [userId, setUserId] = useState<number | null>(1);
    const [email, setEmail] = useState<string | null>('sewmini@gmail.com'); 

    return (
        <AppContext.Provider value={{ backendUrl, setBackendUrl, userId, setUserId, email, setEmail }}>
            {children}
        </AppContext.Provider>
    );
};