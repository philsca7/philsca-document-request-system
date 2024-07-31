import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { ArrowRight } from "lucide-react";
import ForgotPasswordDialog from "./forgot-password";
import { useState } from "react";
import useSession from "@/hook/use-session";
import { loginSchema } from "@/lib/types";

interface SignInFormProps {
    form: UseFormReturn<{
        email: string;
        password: string;
    }, any, undefined>;
    onLogin: (values: z.infer<typeof loginSchema>) => Promise<void>;
}

const SignInForm: React.FC<SignInFormProps> = ({
    form,
    onLogin
}) => {

    const { loading } = useSession();

    const [openForgotPassword, setOpenForgotPassword] = useState(false);

    const handleClickForgotPassword = () => {
        setOpenForgotPassword(true);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onLogin)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="Enter your email" {...field} />
                            </FormControl>
                            {!openForgotPassword && <FormMessage />}
                        </FormItem>
                    )}
                />
                <div className="flex w-full">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input disabled={loading} type="password" className=" w-[17rem] lg:w-80" placeholder="Enter your password" {...field} />
                                </FormControl>
                                {!openForgotPassword && <FormMessage />}
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end">
                    <ForgotPasswordDialog form1={form} openForgotPassword={openForgotPassword} setOpenForgotPassword={setOpenForgotPassword} handleClickForgotPassword={handleClickForgotPassword} />
                </div>
                <Button className="p-2 w-full" type="submit">
                    {loading ? (
                        <div className="h-6 w-6 rounded-full border-2 border-solid border-white border-e-transparent animate-spin" />
                    ) : (
                        'Sign In'
                    )}
                </Button>
            </form>
        </Form>
    )
}

export default SignInForm;