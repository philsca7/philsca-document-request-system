"use client"

import { Button } from "@/components/ui/button";
import { Row } from "@tanstack/react-table";
import { CalendarIcon, Minus, MoreHorizontal, Plus, ShieldQuestion } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";
import { Request } from "./column";
import { get, ref, set, update } from "firebase/database";
import { database } from "@/firebase";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { v4 as uuidv4 } from "uuid";
import { DateTimePicker } from "@/components/ui/date-time-picker";

interface RowActionProps {
    row: Row<Request>
}


const formSchema = z.object({
    status: z.string().min(1, "Status is required"),
    estimate_completion: z.date().optional()
});

const RowAction: React.FC<RowActionProps> = ({
    row
}) => {

    const { theme } = useTheme();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: row.original.status,
            estimate_completion: row.original.status !== "Completed" || "Claimed" ? row.original.estimate_completion ? row.original.estimate_completion : undefined : undefined
        },
    });

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const onOpen = () => {
        setOpen(true);
    }

    const handleOnOpenChange = (open: boolean) => {
        if (!open) {
            setOpen(false);
        }
    }

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

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            if (values.estimate_completion !== undefined && values.status !== "Completed" && values.status !== "Claimed") {
                await update(ref(database, `requests/${row.original.userId}/${row.original.id}`), {
                    estimate_completion: values.estimate_completion,
                    updatedAt: Date.now()
                });

                await set(ref(database, `requests/${row.original.userId}/${row.original.id}/requestsLogs/${uuidv4()}`), {
                    action: `The estimated completion date is now set for your request(${row.original.document_type}) to ${format(values.estimate_completion, "	PPPppp")}.`,
                    timestamp: Date.now()
                });

                await set(ref(database, `user/${row.original.userId}/notification/${uuidv4()}`), {
                    title: `Update on your request(${row.original.document_type})`,
                    message: `The estimated completion date is now set for your request(${row.original.document_type}) to ${format(values.estimate_completion, "	PPPppp")}.`,
                    timestamp: Date.now(),
                    read: false,
                    route: 'myrequests'
                });

                const userRef = ref(database, `user/${row.original.userId}`);

                const snap = await get(userRef);
                const userData = snap.val();
                const expoData = userData.expoPushToken;

                if (expoData) {
                    sendPushNotification(expoData, `Update on your request(${row.original.document_type})`, `The estimated completion date is now set for your request(${row.original.document_type}) to ${format(values.estimate_completion, "	PPPppp")}.`, 'myrequests');
                }
            } else if (values.status === 'Completed') {
                await update(ref(database, `requests/${row.original.userId}/${row.original.id}`), {
                    status: values.status,
                    updatedAt: Date.now()
                });

                await set(ref(database, `requests/${row.original.userId}/${row.original.id}/requestsLogs/${uuidv4()}`), {
                    action: `your request is now ${values.status} you can now get your ${row.original.document_type} within our office hours`,
                    timestamp: Date.now()
                });

                await set(ref(database, `user/${row.original.userId}/notification/${uuidv4()}`), {
                    title: `Update on your request(${row.original.document_type})`,
                    message: `your request is now ${values.status} you can now get your ${row.original.document_type} within our office hours`,
                    timestamp: Date.now(),
                    read: false,
                    route: 'myrequests'
                });

                const userRef = ref(database, `user/${row.original.userId}`);

                const snap = await get(userRef);
                const userData = snap.val();
                const expoData = userData.expoPushToken;

                if (expoData) {
                    sendPushNotification(expoData, `Update on your request(${row.original.document_type})`, `your request is now ${values.status} you can now get your ${row.original.document_type} within our office hours`, 'myrequests');
                }
            } else if (values.status === 'Claimed') {
                await update(ref(database, `requests/${row.original.userId}/${row.original.id}`), {
                    status: values.status,
                    updatedAt: Date.now()
                });

                await set(ref(database, `requests/${row.original.userId}/${row.original.id}/requestsLogs/${uuidv4()}`), {
                    action: `you have claimed your ${row.original.document_type}. Thank you for your patience and cooperation`,
                    timestamp: Date.now()
                });

                await set(ref(database, `user/${row.original.userId}/notification/${uuidv4()}`), {
                    title: `Update on your request(${row.original.document_type})`,
                    message: `you have claimed your ${row.original.document_type}. Thank you for your patience and cooperation`,
                    timestamp: Date.now(),
                    read: false,
                    route: 'myrequests'
                });

                const userRef = ref(database, `user/${row.original.userId}`);

                const snap = await get(userRef);
                const userData = snap.val();
                const expoData = userData.expoPushToken;

                if (expoData) {
                    sendPushNotification(expoData, `Update on your request(${row.original.document_type})`, `you have claimed your ${row.original.document_type}. Thank you for your patience and cooperation`, 'myrequests');
                }
            } else {
                await update(ref(database, `requests/${row.original.userId}/${row.original.id}`), {
                    status: values.status,
                    updatedAt: Date.now()
                });

                await set(ref(database, `requests/${row.original.userId}/${row.original.id}/requestsLogs/${uuidv4()}`), {
                    action: `your request is now ${values.status}`,
                    timestamp: Date.now()
                });

                await set(ref(database, `user/${row.original.userId}/notification/${uuidv4()}`), {
                    title: `Update on your request(${row.original.document_type})`,
                    message: `your request is now ${values.status}`,
                    timestamp: Date.now(),
                    read: false,
                    route: 'myrequests'
                });

                const userRef = ref(database, `user/${row.original.userId}`);

                const snap = await get(userRef);
                const userData = snap.val();
                const expoData = userData.expoPushToken;

                if (expoData) {
                    sendPushNotification(expoData, `Update on your request(${row.original.document_type})`, `your request is now ${values.status}`, 'myrequests');
                }
            }

            toast.success('Request data changed.');

        } catch (error) {
            console.log(error);
            toast.error('Someting went wrong.');
        } finally {
            setLoading(false);
            setOpen(false);
        }
    }

    const statusOptions: string[] = [
        "Submitted",
        "Under Review",
        "Approved",
        "In Progress",
        "Completed",
        "Cancelled",
        "Claimed"
    ];

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit flex flex-col gap-1">
                <div className="text-sm font-bold">
                    Action
                </div>
                <Separator />
                <Dialog open={open} onOpenChange={handleOnOpenChange}>
                    <DialogTrigger onClick={onOpen} asChild>
                        <Button variant={"ghost"} size={"sm"} className="text-xs cursor-pointer">
                            Edit
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-fit">
                        <DialogTitle>Update Request</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently change your data from the server.
                        </DialogDescription>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => {

                                        const disabledOptions: string[] = statusOptions.filter(status => {
                                            return statusOptions.indexOf(status) <= statusOptions.indexOf(row.original.status);
                                        });

                                        return (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                <FormControl>
                                                    <Select value={field.value} defaultValue={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger>
                                                            <SelectValue defaultValue={field.value} placeholder="Select a status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {statusOptions.map(status => (
                                                                <SelectItem
                                                                    key={status}
                                                                    value={status}
                                                                    disabled={disabledOptions.includes(status)}
                                                                >
                                                                    {status}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )
                                    }
                                    }
                                />
                                {form.watch("status") !== "Claimed" && form.watch("status") !== "Completed" && (
                                    <FormField
                                        control={form.control}
                                        name="estimate_completion"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="flex flex-row gap-1">
                                                    <div>
                                                        Estimate Completion
                                                    </div>
                                                    <Popover>
                                                        <PopoverTrigger>
                                                            <ShieldQuestion className="h-4 w-4" />
                                                        </PopoverTrigger>
                                                        <PopoverContent className="text-sm text-gray-500 flex flex-row w-fit">
                                                            In order to have <div className="text-black font-bold ml-1 italic">estimate_completion</div>, status must be in <div className="text-black font-bold ml-1 italic">&apos;&apos;In Progress&apos;&apos;.</div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </FormLabel>
                                                <DateTimePicker hourCycle={12} value={field.value} onChange={field.onChange} row={row} />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                <Button disabled={loading} className="w-full" type="submit">
                                    {
                                        loading ? (
                                            <div className={`h-6 w-6 rounded-full border-2 border-solid ${theme === 'dark' ? 'border-black' : 'border-white'} border-e-transparent animate-spin`} />
                                        ) :
                                            'Save'
                                    }
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </PopoverContent>
        </Popover>
    )
}

export default RowAction;