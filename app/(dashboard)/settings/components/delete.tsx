"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SessionData } from "@/lib/lib";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { IronSession } from "iron-session";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod"

interface DeleteProps {
    session: IronSession<SessionData>
}

const formSchema = z.object({
    confirmation: z.string().refine((data) => data === "DELETE ACCOUNT", {
        message: "Confirmation must be 'DELETE ACCOUNT'",
    }),
});

const DeleteSection: React.FC<DeleteProps> = ({
    session
}) => {

    const router = useRouter();

    const [openDelete, setOpenDelete] = useState(false);

    const openDialogDelete = () => {
        setOpenDelete(true);
    }

    const closeDialogDelete = () => {
        setOpenDelete(false);
    }

    const handleOnOpenChange = (open: boolean) => {
        if (!open) {
            setOpenDelete(false);
        }
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            confirmation: "DELETE ACCOUNT",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (values.confirmation === 'DELETE ACCOUNT') {
            try {
                const id = session.uid;
                const response = await axios.post('/api/deleteAccount', {
                    id
                });

                if (response.data.status === 200) {
                    toast.success('Account deleted.');
                    form.reset();
                    router.refresh();
                }
            } catch (error) {
                toast.error('Something went wrong.');
                console.log(error);
            }
        }
    }

    return (
        <Dialog open={openDelete} onOpenChange={handleOnOpenChange}>
            <Button className="text-xs md:text-sm" onClick={openDialogDelete} variant={"destructive"}>DELETE ACCOUNT</Button>
            <DialogContent className="sm:max-w-[425px]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <DialogHeader>
                            <DialogTitle className="poppins-bold">Delete account</DialogTitle>
                            <DialogDescription>
                                <p className="poppins-medium">Are you sure you want to delete your account?</p>
                                <p className="poppins-medium">
                                    Type
                                    <span className="font-extrabold uppercase text-destructive italic px-2">Delete account</span>
                                    below to continue.
                                </p>
                            </DialogDescription>
                        </DialogHeader>
                        <FormField
                            control={form.control}
                            name="confirmation"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <FormLabel htmlFor="confirmation" className="text-right">
                                            Confirmation
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="confirmation"
                                                placeholder="DELETE ACCOUNT"
                                                className="col-span-3"
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage className="flex justify-end" />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button className="poppins-bold" onClick={closeDialogDelete} variant={"secondary"} type="submit">Cancel</Button>
                            <Button className="poppins-bold" variant={"destructive"} type="submit">Delete account</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteSection;