"use client";

import { ModeToggle } from "@/components/theme-toggle";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/controller';

import authPic1 from "@/public/assets/images/authPic1.jpg";
import authPic2 from "@/public/assets/images/authPic2.jpg"
import authPic3 from "@/public/assets/images/authPic3.jpg"
import philscaIcon from "@/public/assets/images/philsca_icon.png";
import Image from "next/image";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import SignInForm from "@/components/signin-form";
import SignUpForm from "@/components/signup-form";

import { app, database } from "@/firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import toast from "react-hot-toast";
import { ref, set } from "firebase/database";
import useSession from "@/hook/use-session";
import { useRouter } from "next/navigation";
import axios from 'axios';
import { createSchema, loginSchema } from "@/lib/types";
import Bowser from "bowser";
import { v4 as uuidv4 } from "uuid";

const auth = getAuth(app);


export default function Page() {

    const { tabValue, setTabValue, loading, setLoading } = useSession();
    const router = useRouter();

    const images = [
        {
            image: authPic1,
            title: "Administrative Workflow for Student Registrar Requests",
            description: "Streamline and manage student registrar requests efficiently from an administrative perspective."
        },
        {
            image: authPic2,
            title: "Enhancing Registrar Office Operations: Student Request Management",
            description: "Tools and strategies to optimize student registrar request processing and workflow."

        },
        {
            image: authPic3,
            title: "Administrative Solutions for Student Registrar Request Handling",
            description: "Efficiently manage and process student registrar requests using effective administrative tools and procedures."

        }
    ];

    const formLogin = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    });

    const form1 = useForm<z.infer<typeof createSchema>>({
        resolver: zodResolver(createSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    });

    function getOSName() {
        const OS = Bowser.getParser(window.navigator.userAgent);
        return OS.getOSName();
    }

    function getBrowserName() {
        const browser = Bowser.getParser(window.navigator.userAgent);
        return browser.getBrowserName();
    }

    function generateShortUUID() {
        return uuidv4().replace(/-/g, '').substring(0, 11);
    }


    const onLogin = async (values: z.infer<typeof loginSchema>) => {
        setLoading(true);
        try {

            const response = await axios.post('/api/session', { values });

            if (response.data.status === 200) {
                const OS = getOSName();
                const Browser = getBrowserName();

                const ipResponse = await axios.get('https://api.ipify.org?format=json');
                const ipAddress = ipResponse.data.ip;

                await set(ref(database, `admin/${response.data.id}/history/${generateShortUUID()}`), {
                    osUsed: OS,
                    browserUsed: Browser,
                    ipAddress: ipAddress,
                    createdAt: Date.now()
                });

                formLogin.reset();
                setTabValue('login');
                router.push('/dashboard');
            }
        } catch (error) {
            console.log(error);
            toast.error('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative flex lg:grid lg:grid-cols-12 h-screen">
            <div className="col-span-6 h-screen p-2 hidden lg:flex">
                <Swiper
                    className="bg-white rounded-3xl my-1"
                    modules={[Autoplay, A11y]}
                    slidesPerView={1}
                    autoplay
                >
                    {images.map((item, index) => (
                        <SwiperSlide className="relative" key={index}>
                            <a href='/#'>
                                <Image className="w-full h-full object-cover" src={item.image} alt={`slide-${index + 1}`} priority />
                            </a>
                            <div className="absolute bottom-0 bg-gradient-to-t from-black h-96 w-full" />
                            <div className="absolute bottom-0 p-10 space-y-6">
                                <div className="text-white news-cycle-bold text-5xl w-5/6">
                                    {item.title}
                                </div>
                                <div className="text-white text-sm w-[62%]">
                                    {item.description}
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            <div className="flex justify-center lg:col-span-6 w-full">
                <div className="flex flex-col justify-evenly items-center py-8">
                    <div className="h-14 w-14">
                        <Image className="w-full h-full object-contain" src={philscaIcon} alt={`icon`} priority />
                    </div>
                    <div className="flex flex-col justify-center items-center gap-2">
                        <div className="news-cycle-bold text-5xl">
                            Welcome Back
                        </div>
                        <div className="text-gray-500 font-semibold text-sm">
                            Enter your email and password to access your account
                        </div>
                        <div className="mt-6">
                            <SignInForm form={formLogin} onLogin={onLogin} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute flex justify-end w-full p-6">
                <ModeToggle />
            </div>
        </div>
    )
}
