import { app, database } from "@/firebase";
import { getSession } from "@/lib/action";
import { ref, remove } from "firebase/database";
import { NextResponse } from "next/server";
import { getAuth, deleteUser } from "firebase/auth";

export async function POST(
    req: Request,
) {
    const auth = getAuth(app);
    const user = auth.currentUser;
    const session = await getSession();
    const body = await req.json();
    const { id } = body;

    try {

        if (!id) {
            return NextResponse.json({ error: 'ID is required.' });
        }

        if (!user) {
            return NextResponse.json({ error: 'User is required.' });
        }

        await remove(ref(database, `admin/${id}`));
        session.destroy();
        await deleteUser(user);

        return NextResponse.json({ status: 200 });

    } catch (error) {
        console.log('INVENTORY', error);
        return NextResponse.json("Internal error", { status: 500 });
    }
}