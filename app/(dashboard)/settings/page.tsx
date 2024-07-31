
import { getSession } from "@/lib/action";
import Settings from "./components/settings";

const SettingsPage = async () => {

    const session = await getSession();

    return (
        <>
            <Settings session={session} />
        </>
    )
}

export default SettingsPage;