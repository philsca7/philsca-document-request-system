"use client";

import { HandHelping, LayoutDashboard, Mail, Settings, X } from "lucide-react";
import useMenuModal from "@/hook/use-menu-modal";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import Link from "next/link";

const MobileMenu = () => {

    const menuModal = useMenuModal();
    const { theme } = useTheme();
    const pathname = usePathname();

    const routes = [
        {
            href: '/dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard className="h-6 w-6" />,
            active: pathname === '/dashboard'
        },
        {
            href: '/request',
            label: 'Requests',
            icon: <HandHelping className="h-6 w-6" />,
            active: pathname === '/request'
        },
        {
            href: '/message',
            label: 'Message',
            icon: <Mail className="h-6 w-6" />,
            active: pathname === '/message'
        },
        {
            href: '/settings',
            label: 'Settings',
            icon: <Settings className="h-6 w-6" />,
            active: pathname === '/settings'
        }
    ];

    return (
        <div className={`fixed z-30 lg:hidden top-0 left-0 w-full h-full ${theme === 'dark' ? 'bg-[#020817]' : 'bg-white'} px-4 overflow-y-scroll`}>
            <div className="flex lg:hidden items-center justify-end p-4 sm:p-6">
                <X onClick={() => menuModal.onClose()} className="hover:scale-110 cursor-pointer transition" />
            </div>
            <div className="flex flex-col p-4 sm:p-6 space-y-8">
                {routes.map((route) => (
                    <Link onClick={() => menuModal.onClose()} key={route.href} href={route.href}
                        className={`${route.active ? ` ${theme === 'dark' ? 'bg-gray-900' : 'bg-[#e3f4eb]'} text-[#16763a] ` : ''} px-4 h-24 font-semibold flex gap-2 items-center rounded-xl cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-900' : 'hover:bg-[#e3f4eb]'} transition-colors`}>
                        {route.icon}
                        {route.label}
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default MobileMenu;