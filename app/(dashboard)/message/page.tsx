"use client";

import MobileMenu from "@/components/mobile-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { database } from "@/firebase";
import useMenuModal from "@/hook/use-menu-modal";
import useMount from "@/hook/use-mount";
import { get, onValue, ref, set, update } from "firebase/database";
import { Menu, Send } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import TimeAgo from 'react-timeago';
import { v4 as uuidv4 } from "uuid";

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

const Message = () => {

    const { theme } = useTheme();
    const menuModal = useMenuModal();

    const { isMounted } = useMount();
    const [messages, setMessages] = useState<MessageArray[]>([]);
    const [index, setIndex] = useState<number>(0);
    const [inputText, setInputText] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    const openMenu = () => {
        menuModal.onOpen();
    }

    const countUnreadMessages = (messages: Messages[]): number => {
        return messages.filter(message => !message.adminRead).length;
    };

    const truncateString = (str: string, num: number) => {
        if (str.length <= num) {
            return str;
        }
        return str.slice(0, num) + '...';
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, userId: string) => {
        if (event.key === 'Enter') {
            sendMessage(userId);
        }
    };

    const sendMessage = async (userId: string) => {
        if (!inputText.trim()) return;
        if (!userId) return;

        try {
            await set(ref(database, `messages/${userId}/${uuidv4()}`), {
                role: 'admin',
                message: inputText,
                adminRead: true,
                userRead: false,
                timestamp: Date.now()
            });

            setInputText('');

            toast.success('Message sent successfully.');
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong.');
        }
    }

    function getLastMessage(messageArray: MessageArray): Messages | null {
        if (messageArray.messages.length === 0) {
            return null;
        }

        return messageArray.messages.reduce((latest, current) =>
            (current.timestamp > latest.timestamp ? current : latest)
        );
    }

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        setTimeout(() => {
            if (bottomRef.current) {
                bottomRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 1);
    }, []);

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

    return (
        <div className="pl-8 pr-8 py-6 lg:pl-0 h-full w-full">
            {menuModal.isOpen && <MobileMenu />}
            <Menu onClick={() => openMenu()} className="absolute right-0 top-4 flex md:hidden hover:scale-110 cursor-pointer transition mr-4" size={30} />
            <div className="flex flex-col gap-4 mt-12 sm:mt-0 h-full w-full">
                <div className="flex flex-row">
                    <div className="flex flex-col gap-2">
                        {
                            !isMounted ?
                                <Skeleton className="h-12 w-56" />
                                :
                                <div className="text-5xl poppins-bold">
                                    Messages
                                </div>
                        }
                        {
                            !isMounted ?
                                <Skeleton className="h-5 w-96" />
                                :
                                <div className="text-sm font-bold text-gray-500 poppins-bold">
                                    Easily manage and view all your messages in one place
                                </div>
                        }
                    </div>
                </div>
                {
                    !isMounted ?
                        <div className="flex flex-row gap-4">
                            <Skeleton className="h-[500px] w-[390px]" />
                            <Skeleton className="h-[500px] w-full" />
                        </div>
                        :
                        <div className="grid grid-cols-12 gap-4 h-full">
                            <div className={`flex flex-col gap-4 col-span-4 ${theme === 'dark' ? 'bg-[#172030]' : 'bg-[#d4ffe0]'} rounded-2xl p-4`}>
                                <div className="text-2xl poppins-semibold">
                                    Chats
                                </div>
                                <ScrollArea className="h-[420px] px-4">
                                    <div className="flex flex-col gap-4">
                                        {messages.map((data, indexx) => {
                                            const latestMessage = getLastMessage(data);
                                            const unreadCount = countUnreadMessages(data.messages);
                                            if (data.messages.length === 0) {
                                                <div>
                                                    <div className={`relative flex flex-row items-center w-full p-4 rounded-2xl gap-2 ${theme === 'dark' ? index === indexx ? 'bg-gray-300' : 'hover:bg-gray-100' : index === indexx ? 'bg-gray-500' : 'hover:bg-gray-200'}  hover:cursor-pointer`}>
                                                        <Avatar>
                                                            <AvatarImage src={'https://firebasestorage.googleapis.com/v0/b/philsca-93561.appspot.com/o/no-profile.jpg?alt=media&token=6afe5eb2-26a5-4d33-839c-019dd66be6fe'} alt="@shadcn" />
                                                            <AvatarFallback>CN</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <div className={`text-base poppins-semibold`}>
                                                                none
                                                            </div>
                                                            <div className="flex flex-row gap-1 text-xs poppins-medium text-gray-500">
                                                                {
                                                                    latestMessage ? (
                                                                        <>
                                                                            <div>{truncateString(latestMessage.message, 28)}</div>
                                                                            <TimeAgo date={latestMessage.timestamp} />
                                                                        </>
                                                                    ) : (
                                                                        <div>No messages</div>
                                                                    )
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className={`${unreadCount === 0 ? 'hidden' : 'block'} absolute top-2 left-2 h-5 w-5 bg-red-500 rounded-full flex flex-row justify-center items-center text-white text-xs poppins-bold`}>
                                                            {unreadCount}
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                            else {
                                                return (
                                                    <div onClick={async () => {
                                                        setIndex(indexx);
                                                        const messsageRef = ref(database, `messages/${data.userId}`);

                                                        const snapshot = await get(messsageRef);

                                                        if (snapshot.exists()) {
                                                            const updates: any = {};
                                                            snapshot.forEach((childSnapshot) => {
                                                                const childKey = childSnapshot.key;
                                                                updates[`${childKey}/adminRead`] = true;
                                                            });

                                                            await update(messsageRef, updates);
                                                        }
                                                    }} key={indexx} className={`relative flex flex-row items-center w-full p-4 rounded-2xl gap-2 ${index === indexx ? 'bg-gray-300' : 'hover:bg-gray-100'}  hover:cursor-pointer`}>
                                                        <Avatar>
                                                            <AvatarImage src={data.photoURL} alt="@shadcn" />
                                                            <AvatarFallback>CN</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <div className={`text-base poppins-semibold`}>
                                                                {data.studentId}
                                                            </div>
                                                            <div className="flex flex-row gap-1 text-xs poppins-medium text-gray-500">
                                                                {
                                                                    latestMessage ? (
                                                                        <>
                                                                            <div>{truncateString(latestMessage.message, 28)}</div>
                                                                            <TimeAgo date={latestMessage.timestamp} />
                                                                        </>
                                                                    ) : (
                                                                        <div>No messages</div>
                                                                    )
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className={`${unreadCount === 0 ? 'hidden' : 'block'} absolute top-2 left-2 h-5 w-5 bg-red-500 rounded-full flex flex-row justify-center items-center text-white text-xs poppins-bold`}>
                                                            {unreadCount}
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        })}
                                    </div>
                                </ScrollArea>
                            </div>
                            <div className={`flex flex-col gap-4 col-span-8 ${theme === 'dark' ? 'bg-[#172030]' : 'bg-[#d4ffe0]'} rounded-2xl p-4 h-full w-full`}>
                                <div className="flex flex-row items-center px-4 gap-4 h-[15%] bg-white rounded-lg">
                                    <Avatar>
                                        <AvatarImage src={messages[index]?.photoURL ? messages[index]?.photoURL.length !== 0 ? messages[index]?.photoURL : 'https://firebasestorage.googleapis.com/v0/b/philsca-93561.appspot.com/o/no-profile.jpg?alt=media&token=6afe5eb2-26a5-4d33-839c-019dd66be6fe' : 'https://firebasestorage.googleapis.com/v0/b/philsca-93561.appspot.com/o/no-profile.jpg?alt=media&token=6afe5eb2-26a5-4d33-839c-019dd66be6fe'} alt="@shadcn" />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <div className={`text-base text-black poppins-semibold`}>
                                            {messages[index]?.studentId}
                                        </div>
                                        <div className="flex flex-row items-center gap-1 text-xs poppins-medium text-gray-500">
                                            <div className={`h-2 w-2 ${messages[index]?.active ? messages[index]?.active === true ? 'bg-green-500 ' : 'bg-gray-500' : ''} rounded-full`} />
                                            <div>
                                                {messages[index]?.active ? messages[index]?.active === true ? 'Active now' : 'not active' : ''}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col h-[85%] bg-white rounded-lg p-4 w-full">
                                    <div className="h-[90%]">
                                        <ScrollArea className="flex flex-row gap-2 h-[300px] px-4">
                                            {messages[index]?.messages.slice().sort((a, b) => a.timestamp - b.timestamp).map((message, index) => {
                                                return (
                                                    <div key={index}>
                                                        {
                                                            message.role === 'user' &&
                                                            <div className="flex flex-row items-center gap-2 justify-start mb-4">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarImage src={messages[index]?.photoURL.length !== 0 ? messages[index]?.photoURL : 'https://firebasestorage.googleapis.com/v0/b/philsca-93561.appspot.com/o/no-profile.jpg?alt=media&token=6afe5eb2-26a5-4d33-839c-019dd66be6fe'} alt="@shadcn" />
                                                                </Avatar>
                                                                <div className={`bg-[#f4f4f4] p-2 rounded-2xl poppins-medium text-sm text-black`}>
                                                                    {message.message}
                                                                </div>
                                                            </div>
                                                        }
                                                        {
                                                            message.role === 'admin' &&
                                                            <div className="flex justify-end mb-4">
                                                                <div className={`w-fit p-2 rounded-2xl poppins-medium text-sm bg-[#e3f4eb] text-black`}>
                                                                    {message.message}
                                                                </div>
                                                            </div>
                                                        }
                                                        <div ref={bottomRef} />
                                                    </div>
                                                )
                                            })}
                                        </ScrollArea>
                                    </div>
                                    <div className="flex flex-row h-[10%] w-full">
                                        <div className="w-[90%]">
                                            <Input onKeyDown={(e) => handleKeyDown(e, messages[index]?.userId)} value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type a message here..." />
                                        </div>
                                        <div className="flex justify-center items-center w-[10%]">
                                            <Button onClick={() => sendMessage(messages[index]?.userId)} className="bg-black">
                                                <Send className="h-6 w-6" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                }
            </div>
        </div>
    )
}

export default Message;