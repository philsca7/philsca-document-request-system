"use client";

import { Box, Files, Footprints, HandHelping, Handshake, Home, LayoutDashboard, Mail, Newspaper, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { database } from "@/firebase";
import { get, onValue, ref } from "firebase/database";

interface MessageArray {
    userId: string;
    studentId: string;
    photoURL: string;
    active: boolean;
    messages: Messages[];
}

interface Messages {
    id: string;
    role: string;
    adminRead: boolean;
    userRead: boolean;
    message: string;
    timestamp: number;
}

interface MainNavigationProps {
    isMounted: boolean
}

const MainNavigation: React.FC<MainNavigationProps> = ({
    isMounted
}) => {

    const { theme } = useTheme();
    const pathname = usePathname();
    const [messages, setMessages] = useState<MessageArray[]>([]);

    const countAdminReadFalse = () => {
        return messages.reduce((count, messageArray) => {
            return count + messageArray.messages.filter(message => !message.adminRead).length;
        }, 0);
    };

    const skeletonArray = [1, 2, 3, 4, 5];

    useEffect(() => {
        const fetchData = async (snapshot: any) => {
            const messageData = snapshot.val();
            if (messageData) {
                const messageArray: Array<MessageArray> = [];
                for (const userId of Object.keys(messageData)) {
                    const userMessages = messageData[userId];
                    const userMessageArray: Messages[] = [];
                    for (const messageId of Object.keys(userMessages)) {
                        userMessageArray.push({
                            id: messageId,
                            ...userMessages[messageId]
                        });
                    }

                    try {
                        const userSnapshot = await get(ref(database, `user/${userId}`));
                        const snapval = userSnapshot.val();
                        const { studentId, photoURL, active } = snapval;
                        messageArray.push({ active, photoURL, studentId, userId, messages: userMessageArray });
                    } catch (error) {
                        console.error("Error fetching user data:", error);
                    }
                }
                console.log(messageArray);
                setMessages(messageArray);
            }
        };

        const setUpUserListeners = (userIds: string[]) => {
            const userListeners: { [key: string]: () => void } = {};
            for (const userId of userIds) {
                const userRef = ref(database, `user/${userId}`);
                userListeners[userId] = onValue(userRef, async () => {
                    // Re-fetch the messages data when user data changes
                    const messageSnapshot = await get(ref(database, `messages`));
                    fetchData(messageSnapshot);
                });
            }
            return userListeners;
        };

        // Create an async function to handle the effect logic
        const fetchAndSetUpListeners = async () => {
            const messageRef = ref(database, `messages`);
            const messageListener = onValue(messageRef, fetchData);

            // Clean up listeners on component unmount
            return () => {
                messageListener(); // Remove the message listener
            };
        };

        const cleanUpListeners = fetchAndSetUpListeners();

        return () => {
            cleanUpListeners.then(cleanUp => cleanUp && cleanUp());
        };
    }, [database]);

    const routes = [
        {
            href: '/dashboard',
            icon: <LayoutDashboard className="h-6 w-6" />,
            active: pathname === '/dashboard'
        },
        {
            href: '/request',
            icon: <HandHelping className="h-6 w-6" />,
            active: pathname === '/request'
        },
        {
            href: '/message',
            icon: <Mail className="h-6 w-6" />,
            active: pathname === '/message'
        },
        {
            href: '/news-updates',
            label: 'News/Updates',
            icon: <Newspaper className="h-6 w-6" />,
            active: pathname === '/news-updates'
        },
        {
            href: '/settings',
            icon: <Settings className="h-6 w-6" />,
            active: pathname === '/settings'
        }
    ];

    return (
        <nav className="mx-6 hidden lg:flex lg:flex-col space-y-6 items-center">
            {
                !isMounted ?
                    <React.Fragment>
                        {
                            skeletonArray.map((_, index) => (
                                <Skeleton key={index} className="h-12 w-12 p-3" />
                            ))
                        }
                    </React.Fragment>
                    :
                    <React.Fragment>
                        {routes.map((route) => (
                            <Link key={route.href} href={route.href}
                                className={`relative ${route.active ? ` ${theme === 'dark' ? ' bg-[#172030]' : 'bg-[#16763a]'} text-white` : ''} flex items-center hover:scale-105 cursor-pointer transition p-3 rounded-xl`}>
                                {route.icon}
                                {
                                    route.href === '/message' &&
                                    <div className={`${countAdminReadFalse() === 0 ? 'hidden' : 'block'} absolute top-1 right-1 h-5 w-5 bg-red-500 rounded-full flex flex-row justify-center items-center text-white text-xs poppins-bold`}>
                                        {countAdminReadFalse()}
                                    </div>
                                }
                            </Link>
                        ))}
                    </React.Fragment>
            }
        </nav >
    )
}

export default MainNavigation;