"use client";

import { Button } from "@/components/ui/button";
import { Collapsible as Collap, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { database } from "@/firebase";
import { SessionData } from "@/lib/lib";
import { format } from "date-fns";
import { onValue, ref } from "firebase/database";
import { IronSession } from "iron-session";
import { ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";

interface CollapsibleProps {
    session: IronSession<SessionData>;
}

type History = {
    osUsed: string;
    browserUsed: string;
    ipAddress: string;
    createdAt: number;
}

const Collapsible: React.FC<CollapsibleProps> = ({
    session
}) => {

    const [data, setData] = useState<History[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const historyRef = ref(database, `admin/${session.uid}/history`);

        const fetchData = (snapshot: any) => {
            const userHistoryData = snapshot.val();
            if (userHistoryData) {
                const userHistoryArray: History[] = Object.keys(userHistoryData).map(key => ({
                    id: key,
                    ...userHistoryData[key]
                }));

                // Sort data by createdAt in descending order
                userHistoryArray.sort((a, b) => b.createdAt - a.createdAt);

                setData(userHistoryArray);
            }
        };

        onValue(historyRef, fetchData);

        return () => {
            // Unsubscribe from the real-time listener when component unmounts
            onValue(historyRef, fetchData);
        };
    }, [session.uid]);

    return (
        <Collap
            open={isOpen}
            onOpenChange={setIsOpen}
            className="w-[350px] space-y-2"
        >
            <div className="flex items-center justify-between space-x-4 text-lg poppins-bold">
                <div className="text-lg font-bold">
                    Sign-in History
                </div>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-9 p-0">
                        <ChevronsUpDown className="h-4 w-4" />
                        <span className="sr-only">Toggle</span>
                    </Button>
                </CollapsibleTrigger>
            </div>
            <div className="flex justify-between rounded-md border px-4 py-3 font-mono text-sm">
                <div>
                    <div>
                        Ip-Address: {data[0]?.ipAddress}
                    </div>
                    <div>
                        OS: {data[0]?.osUsed}
                    </div>
                    <div>
                        Browser: {data[0]?.browserUsed}
                    </div>
                    <div>
                        When: {data[0] && format(data[0]?.createdAt, 'MMM dd, yyyy')}
                    </div>
                </div>
                <div className="text-gray-500 italic">
                    latest
                </div>
            </div>
            <CollapsibleContent className="space-y-2">
                {data.slice(1).map((item, index) => (
                    <div key={index} className="flex flex-col rounded-md border px-4 py-3 font-mono text-sm">
                        <div>
                            Ip-Address: {item.ipAddress}
                        </div>
                        <div>
                            OS: {item.osUsed}
                        </div>
                        <div>
                            Browser: <span className="text-green-500">{item.browserUsed}</span>
                        </div>
                        <div>
                            When: {format(item.createdAt, 'MMM dd, yyyy')}
                        </div>
                    </div>
                ))}
            </CollapsibleContent>
        </Collap>
    );
}

export default Collapsible;