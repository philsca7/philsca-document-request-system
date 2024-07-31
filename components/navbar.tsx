"use client";

import Image from "next/image";
import philscaIcon from "@/public/assets/images/philsca_icon.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, LogOut, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import useMount from "@/hook/use-mount";
import { useEffect, useState } from "react";
import useMenuModal from "@/hook/use-menu-modal";
import MainNavigation from "./navigation/main-navigation";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "./ui/button";

const Navbar = () => {

    const { theme } = useTheme();
    const router = useRouter();
    const { isMounted, setIsMounted } = useMount();

    const signOut = async () => {
        try {
            const response = await axios.post('/api/signOut');
            if (response.data.status === 200) {
                router.push("/auth");
            }

        } catch (error) {
            console.log(error);
            toast.error('Something went wrong.');
        }
    }

    useEffect(() => {
        setTimeout(() => {
            setIsMounted(true);
        }, 2000);
    }, []);

    return (
        <>
            <div className="lg:flex lg:flex-col justify-between items-center h-full py-4 w-2/3 border-r-2 border-slate-200">
                {
                    !isMounted ?
                        <Skeleton className="h-14 w-14" />
                        :
                        <Link href={'/dashboard'} className=" hover:scale-105 transition">
                            <div className="h-14 w-14">
                                <Image className="w-full h-full object-contain" src={philscaIcon} alt={`icon`} priority />
                            </div>
                        </Link>
                }
                <MainNavigation isMounted={isMounted} />
                {
                    !isMounted ?
                        <Skeleton className="h-10 w-10 rounded-full" />
                        :
                        <Popover>
                            <PopoverTrigger>
                                <Avatar>
                                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                            </PopoverTrigger>
                            <PopoverContent>
                                <Button onClick={signOut} className="w-full">
                                    <LogOut className="h-4 w-4 mr-2" />Sign out
                                </Button>
                            </PopoverContent>
                        </Popover>
                }
            </div>
        </>
    )
}

export default Navbar;