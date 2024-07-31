"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import RowAction from "./row-action"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import ImageZoomer from "../components/image-zoomer"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { get, ref, set, update } from "firebase/database"
import { database } from "@/firebase"
import { v4 as uuidv4 } from "uuid";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
interface RequestLog {
    id: string;
    action: string;
    paymentImage?: string;
    timestamp: number;
}

export type Request = {
    id: string;
    document_type: string;
    email: string;
    estimate_completion: Date;
    reason: string;
    request_date: number;
    status: RequestStatus;
    student_number: string;
    payment_image: string;
    payment_image_name: string;
    userId: string;
    requestsLogs: RequestLog[]
}

const getStatusStyles = (status: RequestStatus) => {
    const statusColors: Record<RequestStatus, { textColor: string }> = {
        "Submitted": { textColor: "#A3A3A3" },
        "Under Review": { textColor: "#007AFF" },
        "Approved": { textColor: "#34C759" },
        "In Progress": { textColor: "#FF9500" },
        "Completed": { textColor: "#32D74B" },
        "Cancelled": { textColor: "#FF3B30" },
        "Claimed": { textColor: "#4A90E2" }
    };
    return statusColors[status] || { textColor: "#000000" }; // Fallback color if status not found
};

type RequestStatus = "Submitted" | "Under Review" | "Approved" | "In Progress" | "Completed" | "Cancelled" | "Claimed";

async function sendPushNotification(expoPushToken: string, title: string, body: string, route: string) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: `${title}`,
        body: `${body}`,
        data: { route: `${route}` },
    };
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

const onUnderReview = async (userId: string, requestId: string) => {
    try {

        const userRef = ref(database, `user/${userId}`);
        const requestRef = ref(database, `requests/${userId}/${requestId}`);
        const snapshot = await get(requestRef);
        if (snapshot.exists()) {
            const requestData = snapshot.val();
            const status = requestData.status;
            const docType = requestData.document_type;

            if (status === 'Submitted') {
                await update(ref(database, `requests/${userId}/${requestId}`), {
                    status: "Under Review",
                    updatedAt: Date.now()
                });

                await set(ref(database, `requests/${userId}/${requestId}/requestsLogs/${uuidv4()}`), {
                    action: 'your request is now under review',
                    timestamp: Date.now()
                });

                await set(ref(database, `user/${userId}/notification/${uuidv4()}`), {
                    title: `Update on your request(${docType})`,
                    message: `your request is now under review`,
                    timestamp: Date.now(),
                    read: false,
                    route: 'myrequests'
                });

                const snap = await get(userRef);
                const userData = snap.val();
                const expoData = userData.expoPushToken;

                if (expoData) {
                    sendPushNotification(expoData, `Update on your request(${docType})`, `your request is now under review`, 'myrequests');
                }
            }
        }

    } catch (error) {
        console.log(error);
        toast.error('Something went wrong.');
    }
}


export const columns: ColumnDef<Request>[] = [
    {
        accessorKey: "student_number",
        header: "Student #",
        cell: ({ row }) => (
            <div className='font-semibold text-base'>
                {row.original.student_number}
            </div>
        ),
    },
    {
        accessorKey: "email",
        header: "Payment Image",
        cell: ({ row }) => (
            <>
                {
                    row.original.payment_image ?

                        <Dialog>
                            <DialogTrigger onClick={() => onUnderReview(row.original.userId, row.original.id)} asChild>
                                <div className="flex justify-center items-center h-auto hover:scale-110 cursor-pointer transition">
                                    <Image src={row.original.payment_image} width={75} height={125} alt="" quality={100} />
                                </div>
                            </DialogTrigger>
                            <DialogContent className="w-fit">
                                <ImageZoomer paymentImage={row.original.payment_image} />
                            </DialogContent>
                        </Dialog>
                        :
                        <div className="text-gray-500 text-center italic">
                            none
                        </div>
                }
            </>
        ),
    },
    {
        accessorKey: "reason",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Reason
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className='font-semibold text-base'>
                {row.original.reason}
            </div>
        ),
    },
    {
        accessorKey: "document_type",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Type
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className='font-semibold text-base'>
                {row.original.document_type}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const { textColor } = getStatusStyles(row.original.status);
            return (
                <div className='flex flex-row justify-center items-center gap-2 font-semibold text-base'>
                    <div style={{ backgroundColor: textColor }} className='h-2 w-2 rounded-full' />
                    {row.original.status}
                </div>
            );
        },
    },
    {
        accessorKey: "payment_name",
        header: "Payment Status",
        cell: ({ row }) => (
            <div className={`font-semibold text-base text-center ${row.original.payment_image_name ? 'text-green-500' : 'text-yellow-500'}`}>
                {row.original.payment_image_name ? 'Paid' : 'Unpayed'}
            </div>
        ),
    },
    {
        accessorKey: "request_date",
        header: "Request Date",
        cell: ({ row }) => (
            <div className='font-semibold text-base'>
                {format(row.original.request_date, 'MMM dd, yyyy')}
            </div>
        ),
    },
    {
        accessorKey: "estimate_completion",
        header: "Estimate Completion",
        cell: ({ row }) => (
            <div className={`font-semibold text-base text-center ${row.original.estimate_completion ? 'text-black' : 'text-gray-500'}`}>
                {row.original.estimate_completion ? format(row.original.estimate_completion, 'MMM dd, yyyy hh:mm aaa') : '----'}
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return (
                <RowAction row={row} />
            )
        },
    },

]
