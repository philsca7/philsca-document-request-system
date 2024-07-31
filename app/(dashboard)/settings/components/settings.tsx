"use client";

import { SessionData } from "@/lib/lib";
import { IronSession } from "iron-session";
import Collapsible from "./collapsible";
import { ModeToggle } from "@/components/theme-toggle";
import Delete from "./delete";
import { Menu } from "lucide-react";
import MobileMenu from "@/components/mobile-menu";
import useMenuModal from "@/hook/use-menu-modal";

interface SettingsProps {
    session: IronSession<SessionData>
}

const Settings: React.FC<SettingsProps> = ({
    session
}) => {

    const menuModal = useMenuModal();

    const openMenu = () => {
        menuModal.onOpen();
    }

    return (
        <div className="pl-8 pr-8 py-6 lg:pl-0 h-full w-full">
            {menuModal.isOpen && <MobileMenu />}
            <Menu onClick={() => openMenu()} className="absolute right-0 top-4 flex md:hidden hover:scale-110 cursor-pointer transition mr-4" size={30} />
            <div className="flex flex-col gap-8 mt-12 sm:mt-0 h-full w-full">
                <div className="flex flex-row">
                    <div className="flex flex-col gap-2">
                        <div className="text-5xl poppins-bold">
                            Settings
                        </div>
                        <div className="text-sm font-bold text-gray-500 poppins-bold">
                            Effortlessly customize your preferences and manage account details
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="text-lg poppins-bold">
                        Theme preference
                    </div>
                    <ModeToggle />
                </div>
                <Collapsible session={session} />
            </div>
        </div>
    )
}

export default Settings;