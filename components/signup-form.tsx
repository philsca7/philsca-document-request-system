import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { createSchema } from "@/lib/types";

interface SignUpFormProps {
    form: UseFormReturn<{
        email: string;
        password: string;
        repassword: string;
    }, any, undefined>;
    onCreateAccount: (values: z.infer<typeof createSchema>) => Promise<void>;
    loading: boolean | undefined;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
    form,
    onCreateAccount,
    loading
}) => {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onCreateAccount)} className="space-y-2">
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
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="relative flex justify-between">
                    <FormField
                        control={form.control}
                        name="repassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input type="password" className="w-80" placeholder="Re-enter password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button className="absolute right-2 bg-[#ff5c00] rounded-full p-2" type="submit">
                        {loading ? (
                            <div className="h-6 w-6 rounded-full border-2 border-solid border-white border-e-transparent animate-spin"/>
                        ) : (
                            <ArrowRight className="h-6 w-6"/>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default SignUpForm;