import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

import { z } from "zod";

import { app } from "@/firebase";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import toast from "react-hot-toast";
import { UseFormReturn, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Dispatch, SetStateAction, useState } from "react";

const auth = getAuth(app);

interface ForgotPasswordDialogProps {
    openForgotPassword: boolean;
    handleClickForgotPassword: () => void;
    setOpenForgotPassword: Dispatch<SetStateAction<boolean>>;
    form1: UseFormReturn<{
        email: string;
        password: string;
    }, any, undefined>
}

export const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email address")
});

const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({
    openForgotPassword,
    handleClickForgotPassword,
    setOpenForgotPassword,
    form1
}) => {

    const [loading, setLoading] = useState<boolean>(false);

    const form = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            email: ""
        },
    });

    const handleResetPassword = async (values: z.infer<typeof resetPasswordSchema>) => {
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, values.email);
            toast.success('Email sent, please check your email.');
            form.reset();
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong.')
        } finally {
            setLoading(false);
        }
    }

    const handleOnOpenChange = (open: boolean) => {
        if (!open) {
            form1.clearErrors('email');
            form1.clearErrors('password');
            setOpenForgotPassword(false);
        }
    }

    return (
        <Dialog open={openForgotPassword} onOpenChange={handleOnOpenChange}>
            <DialogTrigger onClick={handleClickForgotPassword} asChild>
                <div className="text-xs font-semibold text-gray-500 hover:text-black hover:underline cursor-pointer transition">
                    Forgot password?
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Reset Your Password</DialogTitle>
                    <DialogDescription className=" text-gray-500 font-semibold">
                        Please enter your email to reset your password.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleResetPassword)} className="space-y-2 w-full">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Enter your email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            <Button className="bg-[#ff5c00]" type="submit">
                                {loading ? (
                                    <div className="h-4 w-4 rounded-full border-2 border-solid border-white border-e-transparent animate-spin" />
                                ) : (
                                    'Send'
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default ForgotPasswordDialog;
