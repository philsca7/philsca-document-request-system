"use client";

import { Skeleton } from "@/components/ui/skeleton";
import useMount from "@/hook/use-mount";
import Image from "next/image";
import noImage from "@/public/assets/images/no-image-icon.png";
import { Input } from "@/components/ui/input";
import { ChangeEvent, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { database, storage } from "@/firebase";
import { getDownloadURL, ref as storageRef, uploadBytes } from "@firebase/storage";
import { get, ref, set } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import NewsColumn from "./news-column";

const ChildNewsUpdates = () => {

    const { isMounted } = useMount();
    const { theme } = useTheme();
    const router = useRouter();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [imageError, setImageError] = useState<string>('');
    const [titleError, setTitleError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>();
    const [descriptionError, setDescriptionError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    function generateShortUUID() {
        return uuidv4().replace(/-/g, '').substring(0, 11);
    }

    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTitle(value); // Update the title state
        // You can add validation logic here if needed
        if (value.length === 0) {
            setTitleError('Title is required.'); // Example validation error
        } else {
            setTitleError(''); // Clear error message
        }
    };

    const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setDescription(value); // Update the title state
        // You can add validation logic here if needed
        if (value.length === 0) {
            setDescriptionError('Description is required.'); // Example validation error
        } else {
            setDescriptionError(''); // Clear error message
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const value = e.target.files[0];
            setSelectedFile(value);

            if (!e.target.files[0]) {
                setImageError('News/Update is required.');
            } else {
                setImageError('');
            }
        }
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const fetchUserIds = async () => {
        const usersRef = ref(database, 'user');
        const snapshot = await get(usersRef);
        const userIds: any = [];

        snapshot.forEach((childSnapshot) => {
            userIds.push(childSnapshot.key);
        });

        return userIds;
    };

    async function sendPushNotification(expoPushToken: string, title: string, body: string, route: string) {
        const message = {
            to: expoPushToken,
            sound: 'default',
            title: `${title}`,
            body: `${body}`,
            data: { route: `${route}` },
        };
        console.log(process.env.NEXT_PUBLIC_ACCESS_TOKEN);
        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
            },
            mode: 'no-cors',
            body: JSON.stringify(message),
        });
    }

    const onSubmit = async () => {
        if (!selectedFile) {
            setImageError('News/Update is required.');
        } else {
            setImageError('');
        }

        if (!title) {
            setTitleError('Title is required.');
        } else {
            setTitleError('');
        }

        if (!description) {
            setDescriptionError('Description is required.');
        } else {
            setDescriptionError('');
        }

        if (fileInputRef.current) {
            try {
                setLoading(true);
                if (selectedFile && title && description) {
                    const storageReference = storageRef(storage, `newsUpdate/${selectedFile.name}`);
                    await uploadBytes(storageReference, selectedFile);

                    const ImageUrl = await getDownloadURL(storageReference);

                    await set(ref(database, `news/${generateShortUUID()}`), {
                        title: title,
                        description: description,
                        newsImage: ImageUrl,
                        imageName: selectedFile.name,
                        createdAt: format(Date.now(), 'MMM dd, yyyy')
                    });

                    const userIds = await fetchUserIds();

                    for (const userId of userIds) {
                        await set(ref(database, `user/${userId}/notification/${uuidv4()}`), {
                            title: `Announcement/News`,
                            message: `${description}`,
                            timestamp: Date.now(),
                            read: false,
                            route: 'dashboard'
                        });

                        const userRef = ref(database, `user/${userId}`);

                        const snap = await get(userRef);
                        const userData = snap.val();
                        const expoData = userData.expoPushToken;

                        if (expoData) {
                            sendPushNotification(expoData, `Announcement/News`, `${description}`, 'dashboard');
                        }
                    }

                    setTitle('');
                    setDescription('');
                    fileInputRef.current.value = '';
                    setSelectedFile(null);
                    toast.success('News has been added.');
                    router.refresh();
                }
            } catch (error) {
                console.log(error);
                toast.error('Something went wrong.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="h-full w-full flex flex-col lg:grid lg:grid-cols-12 pl-8 pr-8 py-6 lg:pl-0">
            <div className="col-span-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    {!isMounted ? (
                        <Skeleton className="h-9 w-56" />
                    ) : (
                        <div className="text-5xl poppins-bold">
                            News/Updates
                        </div>
                    )}
                    {!isMounted ? (
                        <Skeleton className="h-5 w-64 mt-2" />
                    ) : (
                        <div className="text-sm text-gray-500 poppins-bold">
                            Dynamic news and updates management
                        </div>
                    )}
                </div>
                {!isMounted ? (
                    <div className="flex flex-row h-[400px] gap-2">
                        <div className="flex flex-row justify-center items-center gap-4">
                            <Skeleton className="h-[325px] w-[325px]" />
                            <div className="flex flex-col gap-8">
                                <Skeleton className="h-12 w-56" />
                                <Skeleton className="h-12 w-56" />
                                <Skeleton className="h-20 w-56" />
                                <Skeleton className="h-10 w-56" />
                            </div>
                        </div>
                    </div>
                ) :
                    <div className="flex flex-row h-[400px] gap-2">
                        <div className="flex flex-row justify-center items-center gap-4">
                            <Image
                                className={`border ${theme === 'dark' ? 'border-[#1e293b]' : 'border-[#e2e8f0]'} rounded-lg p-2`}
                                src={selectedFile ? URL.createObjectURL(selectedFile) : noImage}
                                width={325}
                                height={325}
                                alt="Selected Image"
                            />
                            <div className="flex flex-col gap-4">
                                <div className="space-y-4">
                                    <div className={`${imageError ? 'space-y-1' : ''}`}>
                                        <Label>Image</Label>
                                        <div className="relative">
                                            <Input
                                                ref={fileInputRef}
                                                type="file"
                                                onChange={handleFileChange}
                                                accept="image/png, image/jpeg"
                                            />
                                            {selectedFile && (
                                                <div
                                                    onClick={handleClearFile}
                                                    className={`top-[10px] right-2 ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'} absolute p-1 rounded-full cursor-pointer hover:scale-110`}
                                                >
                                                    <X className="h-3 w-3" />
                                                </div>
                                            )}
                                        </div>
                                        {
                                            imageError.length !== 0 &&
                                            <div className="text-sm font-medium text-destructive">
                                                {imageError}
                                            </div>
                                        }
                                    </div>
                                    <div className={`${titleError ? 'space-y-1' : ''}`}>
                                        <Label>Title</Label>
                                        <Input placeholder="Title" value={title} onChange={(e) => handleTitleChange(e)} />
                                        {
                                            titleError.length !== 0 &&
                                            <div className="text-sm font-medium text-destructive">
                                                {titleError}
                                            </div>
                                        }
                                    </div>
                                    <div className={`${descriptionError ? 'space-y-1' : ''}`}>
                                        <Label>Description</Label>
                                        <Textarea className="max-h-80" placeholder="Description" value={description} onChange={(e) => handleDescriptionChange(e)} />
                                        {
                                            descriptionError.length !== 0 &&
                                            <div className="text-sm font-medium text-destructive">
                                                {descriptionError}
                                            </div>
                                        }
                                    </div>
                                </div>
                                <Button onClick={onSubmit} className="w-full bg-[#16763a] hover:bg-[#125b2e]" type="submit">
                                    {loading ? <div className="h-4 w-4 rounded-full border-2 border-solid border-white border-e-transparent animate-spin" /> : 'Submit'}
                                </Button>
                            </div>
                        </div>
                    </div>
                }
            </div>
            {!isMounted ? (
                <div className="col-span-6 h-full w-full flex flex-col justify-center gap-4 p-4">
                    <div className="flex flex-row gap-4">
                        <Skeleton className="h-56 w-44" />
                        <Skeleton className="h-56 w-44" />
                        <Skeleton className="h-56 w-44" />
                    </div>
                    <div className="flex flex-row gap-4">
                        <Skeleton className="h-56 w-44" />
                        <Skeleton className="h-56 w-44" />
                        <Skeleton className="h-56 w-44" />
                    </div>
                </div>
            ) :
                <NewsColumn />
            }
        </div>
    );
};

export default ChildNewsUpdates;
