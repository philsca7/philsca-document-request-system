import { app } from "@/firebase";
import { getSession } from "@/lib/action";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
) {
    const auth = getAuth(app);

    const body = await req.json();
    const { values } = body;

    const session = await getSession();

    try {
        const response = await signInWithEmailAndPassword(auth, values.email, values.password);

        if (response.user !== null) {
            const id = response.user.uid;
            session.uid = response.user.uid;
            session.email = response.user.email || '';
            session.photoUrl = response.user.photoURL || '';
            session.isLoggedIn = true;
            await session.save();

            return NextResponse.json({ status: 200, id });
        }
    } catch (error) {
        console.log('SESSION', error);
        return NextResponse.json("Internal error", { status: 500 });
    }
}