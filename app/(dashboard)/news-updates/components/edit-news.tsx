"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FilePenLine, Pencil } from "lucide-react";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChangeEvent, useRef, useState } from "react";
import { database, storage } from "@/firebase";
import { deleteObject, getDownloadURL, ref as storageRef, uploadBytes } from "@firebase/storage";
import { ref, update } from "firebase/database";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

type News = {
    id: string
    title: string
    description: string
    newsImage: string
    imageName: string
    createdAt: string
}

interface EditNewsProps {
    data: News
}

const formSchema = z.object({
    title: z.string().min(1, 'Title is required.'),
    description: z.string().min(1, 'Description is required.')
});

const EditNews: React.FC<EditNewsProps> = ({
    data
}) => {

    const { theme } = useTheme();
    const router = useRouter();
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: data.title,
            description: data.description
        },
    });

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files?.[0];
            setImage(file);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);
            if (image && fileInputRef.current) {
                const storageReference = storageRef(storage, `newsUpdate/${image.name}`);
                await uploadBytes(storageReference, image);

                const ImageUrl = await getDownloadURL(storageReference);

                await update(ref(database, `news/${data.id}`), {
                    title: values.title,
                    description: values.description,
                    newsImage: ImageUrl,
                    ImageName: image.name,
                    createdAt: format(Date.now(), 'MMM dd, yyyy')
                });

                fileInputRef.current.value = '';
                setImage(null);
                toast.success('News has been updated.');

            } else {

                await update(ref(database, `news/${data.id}`), {
                    title: values.title,
                    description: values.description,
                });

                toast.success('News has been updated.');
                router.refresh();
            }

        } catch (error) {
            console.log(error);
            toast.error('Something went wrong.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className={`${theme === 'dark' ? 'bg-[#16763a]' : 'bg-[#16763a] text-white'} p-1 rounded-full cursor-pointer hover:scale-110`}>
                    <Pencil className="h-3 w-3" />
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit News</DialogTitle>
                    <DialogDescription>
                        Make changes to your news here. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid gap-4 py-4">
                            <div className="relative flex flex-row justify-center">
                                <Avatar className="h-40 w-40">
                                    <AvatarImage src={image ? URL.createObjectURL(image) : data.newsImage} alt="@shadcn" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <div className={`absolute -top-6 right-24 ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'} p-2 rounded-full hover:scale-105 cursor-pointer`}>
                                    <FilePenLine className="h-5 w-5" />
                                    <Input
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleUpload(e)}
                                        ref={fileInputRef}
                                    />
                                </div>
                            </div>
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input id="title" className="w-full" placeholder="shadcn" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea id="title" className="w-full" placeholder="shadcn" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit">
                                {loading ? <div className="h-4 w-4 rounded-full border-2 border-solid border-white border-e-transparent animate-spin" /> : 'Save changes'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default EditNews;