import { app } from "@/firebase";
import { getSession } from "@/lib/action";
import { getAuth, signOut as SignOutCredentials } from "firebase/auth";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
) {
    const auth = getAuth(app);

    try {
        const session = await getSession();
        await SignOutCredentials(auth);
        session.destroy();

        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.log('SIGNOUT', error);
        return NextResponse.json("Internal error", { status: 500 });
    }
}