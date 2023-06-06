"use client";

import Link from "next/link"
import { useRef } from "react";
import { setCookie, getCookie } from "@/lib/cookie";

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import ReCAPTCHA from "react-google-recaptcha"
import path from "path";
let recaptchaRef;
let usernameRef;
let emailRef;

type usernameCheck = {
    available: boolean
    name: string
}

const formSchema = z.object({
    username: z.string().min(4).max(50),
    email: z.string().email(),
    password: z.string().min(8).max(50),
    confirmPassword: z.string().min(8).max(50),
    captcha: z.string({
        required_error: "Please complete the captcha",
        invalid_type_error: "Please complete the captcha"
    }),
}).superRefine(async (val, ctx) => {
    if (val.password !== val.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Password do not match.`,
            path: ["confirmPassword"]
        });
        return z.NEVER;
    }

    const rawResponse = await fetch(siteConfig.restUrl + "/checkname/" + val.username, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
    const content = await rawResponse.json();

    const rawResponse2 = await fetch(siteConfig.restUrl + "/checkemail/" + val.email, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
    const content2 = await rawResponse2.json();

    console.log(content);

    if (content.available == false) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Username is already taken.`,
            path: ["username"]
        });
        return z.NEVER;
    }

    if (content2.available == false) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Email is already taken.`,
            path: ["email"]
        });
        return z.NEVER;
    }

});

/*.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})*/

function onChange(value) {
    console.log("Captcha value:", value);
}

function RegForm() {
    // 1. Define your form.
    recaptchaRef = useRef<ReCAPTCHA>(null);
    usernameRef = useRef<HTMLInputElement>(null);
    emailRef = useRef<HTMLInputElement>(null);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)

        /*if (recaptchaRef.current == null) {
            alert("Recaptcha error, please contact an admin")
            return;
        }
        console.log(recaptchaRef.current.getValue());
        let captchaVal = recaptchaRef.current.getValue();

        if (captchaVal == "") {
            alert("Please complete the captcha")
            return;
        }*/

        const rawResponse = await fetch(siteConfig.restUrl + "/register", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: values.username,
                email: values.email,
                password: values.password,
                captcha: values.captcha,
            })
        });
        const content = await rawResponse.json();


        console.log(content);
        const parsed = JSON.parse(content);

        if (parsed.status == "success") {
            setCookie("token", parsed.token, 30);
            setCookie("username", values.username, 30);
            alert("Account created successfully!")
            window.location.href = "/";
        }

    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="ILoveGomoku" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>

                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="gomole@gomoku.net" {...field} />
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
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="●●●●●●" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>

                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="●●●●●●" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>

                    )}
                />

                <FormField
                    control={form.control}
                    name="captcha"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Beep boop?</FormLabel>
                            <FormControl>
                                <ReCAPTCHA
                                    sitekey="6Led6F4mAAAAAIIRJtaTD4268AC7dvhkOEsd_oub"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>

                    )}
                />

                {/*<ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6Led6F4mAAAAAIIRJtaTD4268AC7dvhkOEsd_oub"
                    onChange={onChange}
                    />*/}
                <Button type="submit" className="float-right">Submit</Button>
            </form>
        </Form>
    )
}

export function RegisterForm() {
    return (
        <>
            {/*<Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Register</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Register</DialogTitle>
                    <DialogDescription>

                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <RegForm />
                </div>
            </DialogContent>
    </Dialog>*/}

            <RegForm />


        </>
    )
}