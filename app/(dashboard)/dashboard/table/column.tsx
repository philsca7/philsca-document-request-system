"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns";
import { useTheme } from "next-themes";

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
    estimate_completion: string;
    reason: string;
    request_date: number;
    status: RequestStatus;
    student_number: string;
    payment_image: string;
    payment_image_name: string;
    userId: string;
    updatedAt: number;
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
        header: "Email",
        cell: ({ row }) => (
            <div className='font-semibold text-base'>
                {row.original.email}
            </div>
        ),
    },
    {
        accessorKey: "document_type",
        header: "Type",
        cell: ({ row }) => (
            <div className='font-semibold text-base'>
                {row.original.document_type}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const { textColor } = getStatusStyles(row.original.status);
            return (
                <div className='flex flex-row items-center gap-2 font-semibold text-base'>
                    <div style={{ backgroundColor: textColor }} className='h-2 w-2 rounded-full' />
                    {row.original.status}
                </div>
            );
        },
    },
    {
        accessorKey: "request_date",
        header: "Request Date",
        cell: ({ row }) => (
            <div className='font-semibold text-base text-center'>
                {format(row.original.request_date, 'MMM dd, yyyy')}
            </div>
        ),
    },
    {
        accessorKey: "estimate_completion",
        header: "Estimate Completion",
        cell: ({ row }) => (
            <div className={`font-semibold text-base text-center ${row.original.estimate_completion ? '' : 'text-gray-500'}`}>
                {row.original.estimate_completion ? format(row.original.estimate_completion, 'MMM dd, yyyy hh:mm aaa') : '----'}
            </div>
        ),
    },
];
