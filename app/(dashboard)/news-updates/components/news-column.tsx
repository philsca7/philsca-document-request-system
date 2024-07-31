"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { database } from "@/firebase";
import { onValue, ref, remove } from "firebase/database";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from 'framer-motion';
import EditNews from "./edit-news";

type News = {
    id: string
    title: string
    description: string
    newsImage: string
    imageName: string
    createdAt: string
}

const NewsColumn = () => {

    const { theme } = useTheme();
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        const newsRef = ref(database, `news`);

        const fetchData = (snapshot: any) => {
            const newsData = snapshot.val();
            if (newsData) {
                const newsArray: any[] = Object.keys(newsData).map(key => ({
                    id: key,
                    ...newsData[key]
                }));

                setNews(newsArray);

            }
        };

        onValue(newsRef, fetchData);

        return () => {
            // Unsubscribe from the real-time listener when component unmounts
            onValue(newsRef, fetchData);
        };
    }, []);

    const onDeleteNews = async (id: string) => {
        try {
            setLoading(true);

            await remove(ref(database, `news/${id}`));
            toast.success('News item deleted successfully.');
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={`col-span-6 h-full w-full flex flex-wrap gap-4 p-4 ${news.length >= 3 && 'justify-center'}`}>
            <AnimatePresence>
                {news.map((data, index) => (
                    <motion.div key={index}
                        layout
                        layoutId={data.id} className={`flex flex-col gap-2 h-56 justify-center ${theme === 'dark' ? 'bg-[#172030]' : 'bg-[#d4ffe0] '} p-4 rounded-lg`}>
                        <div className="flex flex-row justify-end gap-1">
                            <EditNews data={data} />
                            <AlertDialog>
                                <AlertDialogTrigger>
                                    <div
                                        className={`${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'} p-1 rounded-full cursor-pointer hover:scale-110`}
                                    >
                                        <X className="h-3 w-3" />
                                    </div>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your data from our server.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDeleteNews(data.id)}>
                                            {loading ? <div className="h-4 w-4 rounded-full border-2 border-solid border-white border-e-transparent animate-spin" /> : 'Continue'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                        </div>
                        <div className={`flex flex-row items-center text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                            {data.title}
                            <Avatar className="h-6 w-6 ml-1">
                                <AvatarImage src={data.newsImage} alt="@shadcn" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="bg-white h-[80%] w-36 p-2 rounded-lg">
                            <p className="break-words poppins-bold text-xs h-[90%] text-black">
                                {data.description}
                            </p>
                            <div className="text-xs h-[10%] w-full text-end poppins-bold-italic text-gray-500">
                                {data.createdAt}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

export default NewsColumn;