"use client"

import { SessionData } from '@/lib/lib';
import { IronSession } from 'iron-session';
import React, { ReactNode, createContext, useContext } from 'react';

interface SessionProviderProps {
    session: IronSession<SessionData>;
    children: ReactNode;
}

const SessionContext = createContext<IronSession<SessionData>>({} as SessionProviderProps["session"]);

export const SessionProvider = ({ session, children }: SessionProviderProps) => {
    return (
        <SessionContext.Provider value={session}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    return useContext(SessionContext);
};
