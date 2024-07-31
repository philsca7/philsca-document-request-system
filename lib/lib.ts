import { SessionOptions } from "iron-session";

export interface SessionData {
    uid?: string;
    displayName? : string;
    email?: string;
    photoUrl?: string;
    isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
    isLoggedIn: false
}

export const sessionOptions: SessionOptions = {
    password: process.env.SECRET_KEY!,
    cookieName: "philsca-session",
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }
}