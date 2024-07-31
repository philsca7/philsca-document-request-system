"use client";

import { SortingState, VisibilityState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { DataTable } from "./table/data-table";
import { Request as Req, columns } from "./table/column";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Menu, SlidersVertical } from "lucide-react";
import { database } from "@/firebase";
import { onValue, ref } from "firebase/database";
import MobileMenu from "@/components/mobile-menu";
import useMenuModal from "@/hook/use-menu-modal";
import useMount from "@/hook/use-mount";
import { Skeleton } from "@/components/ui/skeleton";

const Request = () => {

    const menuModal = useMenuModal();

    const openMenu = () => {
        menuModal.onOpen();
    }

    const { isMounted } = useMount();

    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [sorting, setSorting] = useState<SortingState>([])

    const [data, setData] = useState<Req[]>([]);

    useEffect(() => {

        const requestRef = ref(database, 'requests');

        const fetchData = (snapshot: any) => {
            const requestData = snapshot.val();
            if (requestData) {
                const childrenArray: Req[] = Object.keys(requestData).flatMap(parentId =>
                    Object.keys(requestData[parentId]).map(childId => ({
                        id: childId,
                        ...requestData[parentId][childId],
                    }))
                );
                setData(childrenArray);
            }
        };

        onValue(requestRef, fetchData);

        return () => {
            // Unsubscribe from the real-time listener when component unmounts
            onValue(requestRef, fetchData);
        };
    }, []);


    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            globalFilter,
            columnVisibility,
            sorting,
        },
    });

    return (
        <div className="pl-8 pr-8 py-6 lg:pl-0 h-full w-full">
            {menuModal.isOpen && <MobileMenu />}
            <Menu onClick={() => openMenu()} className="absolute right-0 top-4 flex md:hidden hover:scale-110 cursor-pointer transition mr-4" size={30} />
            <div className="flex flex-col mt-12 sm:mt-0">
                <div className="flex flex-row">
                    <div className="flex flex-col gap-2">
                        {
                            !isMounted ?
                                <Skeleton className="h-12 w-56" />
                                :
                                <div className="text-5xl poppins-bold">
                                    Requests
                                </div>
                        }
                        {
                            !isMounted ?
                                <Skeleton className="h-5 w-80" />
                                :
                                <div className="text-sm font-bold text-gray-500 poppins-bold">
                                    Manage and track your document requests easily
                                </div>
                        }
                    </div>
                </div>
                <div className="flex flex-col gap-4 mt-4 lg:mt-0">
                    <div className="flex justify-end item-center">
                        {
                            !isMounted ?
                                <Skeleton className="h-10 w-96" />
                                :
                                <div className="flex items-center gap-2 w-full lg:w-[380px]">
                                    <Input
                                        placeholder="Search"
                                        value={globalFilter}
                                        onChange={e => setGlobalFilter(e.target.value)}
                                        className="w-full"
                                    />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button className="text-xs w-1/3">
                                                <SlidersVertical className="h-4 w-4 mr-1" />Advance
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {table
                                                .getAllColumns()
                                                .filter(
                                                    (column) => column.getCanHide()
                                                )
                                                .map((column) => {
                                                    return (
                                                        <DropdownMenuCheckboxItem
                                                            key={column.id}
                                                            className="capitalize"
                                                            checked={column.getIsVisible()}
                                                            onCheckedChange={(value) =>
                                                                column.toggleVisibility(!!value)
                                                            }
                                                        >
                                                            {column.id}
                                                        </DropdownMenuCheckboxItem>
                                                    )
                                                })}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                        }
                    </div>
                    {
                        !isMounted ?
                            <Skeleton className="h-[450px] w-full" />
                            :
                            <DataTable columns={columns} data={data} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility} table={table} />
                    }
                </div>
            </div>
        </div>
    )
}

export default Request;