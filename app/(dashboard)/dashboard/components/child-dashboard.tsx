"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BadgePercent, Bell, ChevronRight, ListChecks, Menu, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { DataTable } from "../table/data.table";
import { Request, columns } from "../table/column";
import { Progress } from "@/components/ui/progress";
import useMenuModal from "@/hook/use-menu-modal";
import MobileMenu from "@/components/mobile-menu";
import { useRouter } from "next/navigation";
import useMount from "@/hook/use-mount";
import { Skeleton } from "@/components/ui/skeleton";
import { database } from "@/firebase";
import { get, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { isSameDay } from "date-fns";


type CustomTooltipProps = {
    active?: boolean;
    payload?: Array<{ value: number }>; // Adjust this type according to your data structure
    label?: string | number;
};

type ChartData = {
    month: string;
    request: number;
}

const ChildDashboard = () => {

    const { theme } = useTheme();
    const router = useRouter();
    const menuModal = useMenuModal();

    const openMenu = () => {
        menuModal.onOpen();
    }

    const { isMounted } = useMount();

    const [data, setData] = useState<ChartData[]>([]);

    const [selectedYear, setSelectedYear] = useState<string>('2024');
    const [request, setRequest] = useState<number>(0);
    const [requestData, setRequestData] = useState<Request[]>([]);
    const [requestData3, setRequestData3] = useState<Request[]>([]);
    const [activeUsers, setActiveUsers] = useState<any[]>([]);
    const [user, setUser] = useState<any[]>([]);

    const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 rounded-lg border-2 border-gray-200">
                    <p className="poppins-bold text-sm">{`${label} : ${payload[0].value} request/s`}</p>
                    {/* You can customize the tooltip content and style here */}
                </div>
            );
        }

        return null;
    };

    useEffect(() => {

        const requestRef = ref(database, `requests`);

        const fetchData = (snapshot: any) => {
            const requestData = snapshot.val();
            if (requestData) {

                const monthCounts: { [key: string]: number } = {
                    Jan: 0,
                    Feb: 0,
                    Mar: 0,
                    Apr: 0,
                    May: 0,
                    Jun: 0,
                    Jul: 0,
                    Aug: 0,
                    Sep: 0,
                    Oct: 0,
                    Nov: 0,
                    Dec: 0,
                };

                let requestCount = 0;

                const childrenArray: Request[] = Object.keys(requestData).flatMap(parentId =>
                    Object.keys(requestData[parentId]).map(childId => ({
                        id: childId,
                        ...requestData[parentId][childId],
                    }))
                );

                setRequestData(childrenArray);

                const todayRequests = childrenArray.filter(request => {
                    const requestDate = new Date(request.request_date);
                    return isSameDay(requestDate, Date.now()); // Check if the dates are the same
                });

                requestCount = todayRequests.length;

                setRequest(requestCount);

                const sortedRequests = [...childrenArray].sort((a, b) => b.updatedAt - a.updatedAt);

                // Get the top 3 most recent requests
                const top3Requests = sortedRequests.slice(0, 3);

                setRequestData3(top3Requests);


                childrenArray.forEach((request: Request) => {
                    const requestDate = new Date(request.request_date);
                    const year = requestDate.getFullYear();
                    const month = requestDate.toLocaleString('default', { month: 'short' });

                    if (year === Number(selectedYear)) {
                        if (monthCounts.hasOwnProperty(month)) {
                            monthCounts[month]++;
                        }
                    }
                });

                const transformedData: ChartData[] = Object.keys(monthCounts).map(month => ({
                    month,
                    request: monthCounts[month],
                }));

                setData(transformedData);
            }
        };

        onValue(requestRef, fetchData);

        return () => {
            // Unsubscribe from the real-time listener when component unmounts
            onValue(requestRef, fetchData);
        };
    }, [selectedYear]);

    useEffect(() => {

        const userRef = ref(database, `user`);

        const fetchData = (snapshot: any) => {
            const userData = snapshot.val();
            if (userData) {
                const userArray: any[] = Object.keys(userData).map(key => ({
                    id: key,
                    ...userData[key]
                }));

                const activeUsersArray: any[] = Object.keys(userData)
                    .map(key => ({ id: key, ...userData[key] }))
                    .filter(user => user.active === true);

                setUser(userArray);

                setActiveUsers(activeUsersArray);
            }
        };

        onValue(userRef, fetchData);

        return () => {
            // Unsubscribe from the real-time listener when component unmounts
            onValue(userRef, fetchData);
        };
    }, []);

    const generateYearOptions = () => {
        const startYear = 2000; // Change this if you want to start from a different year
        const currentYear = new Date().getFullYear();
        const years = [];

        for (let year = startYear; year <= currentYear; year++) {
            years.push({
                value: year.toString(),
                label: year.toString(),
            });
        }

        return years;
    };

    const handleYearChange = (value: string) => {
        setSelectedYear(value);
    };

    const options = generateYearOptions();

    const totalRequest = () => {
        const totalRequest = request;
        const percentage = totalRequest * 100;
        return percentage;
    }

    const totalActiveUser = () => {
        const totalUser = activeUsers.length / user.length;
        const percentage = totalUser * 100;
        return percentage;
    }

    const completedRequest = requestData.filter((request) => request.status === 'Completed');

    const totalEfficieny = () => {
        const totalCompleted = completedRequest.length / requestData.length;
        const percentage = totalCompleted * 100;
        return percentage
    }

    return (
        <div className="flex flex-col md:grid md:grid-cols-12 h-full">
            {menuModal.isOpen && <MobileMenu />}
            <Menu onClick={() => openMenu()} className="absolute right-0 top-4 flex md:hidden hover:scale-110 cursor-pointer transition mr-4" size={30} />
            <div className="flex flex-col gap-8 col-span-9 pl-8 mt-12 sm:mt-0 lg:pl-0 py-6 pr-8 sm:border-r-2 sm:border-slate-200">
                <div className="flex flex-row justify-between">
                    <div className="flex flex-col gap-2">
                        {
                            !isMounted ?
                                <Skeleton className="h-12 w-60" />
                                :
                                <div className="text-5xl poppins-bold">
                                    Dashboard
                                </div>
                        }
                        {
                            !isMounted ?
                                <Skeleton className="h-5 w-48" />
                                :
                                <div className="flex flex-row  gap-1">
                                    <div className="text-sm font-bold text-gray-500 poppins-bold">
                                        Today&apos;s Total Requests:
                                    </div>
                                    <div className="text-sm poppins-extrabold">
                                        12
                                    </div>
                                </div>
                        }
                    </div>
                    {
                        !isMounted ?
                            <Skeleton className="h-6 w-6" />
                            :
                            <Bell className="h-6 w-6" />
                    }
                </div>
                {
                    !isMounted ?
                        <Skeleton className="h-56 w-full" />
                        :
                        <div className="relative flex flex-col">
                            <div className="flex flex-row justify-between">
                                <div className="text-xl poppins-extrabold">
                                    Requests
                                </div>
                                <Select value={selectedYear} defaultValue={selectedYear} onValueChange={(value) => handleYearChange(value)}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue defaultValue={selectedYear} placeholder={selectedYear} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {options.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <ResponsiveContainer className={'absolute -left-6 top-12'} width="100%" height={180}>
                                <BarChart data={data}>
                                    <defs>
                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#F68A4C" />
                                            <stop offset="100%" stopColor="#ED7556" />
                                        </linearGradient>
                                    </defs>
                                    <XAxis fontWeight={500} fontSize={12} stroke={theme === 'dark' ? '#fafbfc' : '#000000'} tick={{ fill: '#6B7280' }} tickLine={false} axisLine={false} dataKey="month" />
                                    <YAxis fontWeight={500} fontSize={12} stroke="#6B7280" tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                    <Bar cursor={'pointer'} barSize={20} radius={[4, 4, 4, 4]} dataKey="request" stackId="a" fill="url(#colorGradient)" label={{
                                        position: 'top',
                                        formatter: (value: number) => (value === 0 ? '' : ''),
                                        style: {
                                            fontWeight: 'bolder',
                                            fontSize: 12,
                                            fill: '#6B7280',
                                            transform: 'translateY(-5px)'
                                        }
                                    }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                }
                {
                    !isMounted ?
                        <Skeleton className="h-56 w-full" />
                        :
                        <div className="relative flex flex-col mt-40">
                            <div className="flex flex-row justify-between">
                                <div className="text-xl poppins-extrabold">
                                    Latest Requests List
                                </div>
                            </div>
                            <div className="mt-2">
                                <DataTable columns={columns} data={requestData3} />
                            </div>
                        </div>
                }
            </div>
            <div className="flex flex-col gap-4 py-6 px-4 col-span-3">
                {
                    !isMounted ?
                        <>
                            <Skeleton className="h-[185px] w-full" />
                            <Skeleton className="h-[185px] w-full" />
                            <Skeleton className="h-[185px] w-full" />
                        </>
                        :
                        <>
                            <div className={`flex justify-center item-center ${theme === 'dark' ? 'bg-[#172030]' : 'bg-[#d4ffe0]'} p-4 rounded-lg`}>
                                <div className="flex flex-col space-y-4 w-full">
                                    <div className="flex flex-row items-center justify-between">
                                        <div className={`text-lg poppins-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                            Daily Request
                                        </div>
                                        <div onClick={() => router.push('/request')} className="flex flex-row items-center text-xs poppins-extrabold text-gray-500 cursor-pointer hover:scale-105">
                                            See All
                                            <ChevronRight className="h-3 w-3" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4 bg-white w-full rounded-lg p-4">
                                        <div className="flex flex-row item-center justify-between w-full">
                                            <div className="flex flex-col">
                                                <div className="poppins-extrabold text-2xl text-black">
                                                    {request}
                                                </div>
                                                <div className="poppins-semibold text-xs text-gray-500">
                                                    The number of requests
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <ListChecks className="h-8 w-8 text-white bg-black rounded-full p-1" />
                                            </div>
                                        </div>
                                        <div>
                                            <Progress className="h-3 [&>*]:bg-[#16763a]" value={totalRequest()} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`flex justify-center item-center ${theme === 'dark' ? 'bg-[#172030]' : 'bg-[#d4ffe0]'} p-4 rounded-lg`}>
                                <div className="flex flex-col space-y-4 w-full">
                                    <div className="flex flex-row items-center justify-between">
                                        <div className={`text-lg poppins-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                            Active Users
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4 bg-white w-full rounded-lg p-4">
                                        <div className="flex flex-row item-center justify-between w-full">
                                            <div className="flex flex-col">
                                                <div className="poppins-extrabold text-2xl text-black">
                                                    {activeUsers.length}
                                                </div>
                                                <div className="poppins-semibold text-xs text-gray-500">
                                                    The number of active Users
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <BadgePercent className="h-8 w-8 text-white bg-black rounded-full p-1" />
                                            </div>
                                        </div>
                                        <div>
                                            <Progress className="h-3 [&>*]:bg-[#16763a]" value={totalActiveUser()} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`flex justify-center item-center ${theme === 'dark' ? 'bg-[#172030]' : 'bg-[#d4ffe0]'} p-4 rounded-lg`}>
                                <div className="flex flex-col space-y-4 w-full">
                                    <div className="flex flex-row items-center justify-between">
                                        <div className={`text-lg poppins-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                            Efficiency
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4 bg-white w-full rounded-lg p-4">
                                        <div className="flex flex-row item-center justify-between w-full">
                                            <div className="flex flex-col">
                                                <div className="poppins-extrabold text-2xl text-black">
                                                    {completedRequest.length}
                                                </div>
                                                <div className="poppins-semibold text-xs text-gray-500">
                                                    % of completed requests
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Sparkles className="h-8 w-8 text-white bg-black rounded-full p-1" />
                                            </div>
                                        </div>
                                        <div>
                                            <Progress className="h-3 [&>*]:bg-[#16763a]" value={totalEfficieny()} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                }
            </div>
        </div>
    )
}

export default ChildDashboard;