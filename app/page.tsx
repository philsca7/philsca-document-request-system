import { getSession } from "@/lib/action"
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await getSession();

    if (!session.isLoggedIn) {
        redirect('/auth');
    }else{
        redirect('/dashboard')
    }
}
