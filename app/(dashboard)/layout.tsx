import { getSession } from "@/lib/action";
import { redirect } from "next/navigation";
import { SessionProvider } from "../session-context";
import Navbar from "@/components/navbar";

export default async function mainLayout({
    children }: {
        children: React.ReactNode;
    }) {

    const session = await getSession();

    if (!session.isLoggedIn) {
        redirect('/auth');
    }

    return (
        <SessionProvider session={session}>
            <div className="h-full w-full lg:grid lg:grid-cols-12">
                <div className="hidden lg:block h-full w-full col-span-1">
                    <Navbar />
                </div>
                <div className="h-full w-full col-span-11">
                    {children}
                </div>
            </div>
        </SessionProvider>
    )
}