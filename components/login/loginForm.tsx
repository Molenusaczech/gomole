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


const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(50),
    captcha: z.string({
        required_error: "Please complete the captcha",
        invalid_type_error: "Please complete the captcha"
    }),
})

/*.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})*/

function onChange(value) {
    console.log("Captcha value:", value);
}

function toLogin() {
    window.location.href = "/register";
}

function LogForm() {
    // 1. Define your form.
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
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

        const rawResponse = await fetch(siteConfig.restUrl + "/login", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
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
            setCookie("username", parsed.username, 30);
            alert("Logged in successfully!")
            window.location.href = "/";
        } else {
            if (parsed.status == "invalid") {
                recaptchaRef.current.reset();
                alert("Invalid email or password, please try again");
            }
        }

    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                        name="captcha"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Beep boop?</FormLabel>
                                <FormControl>

                                    <ReCAPTCHA
                                        id="recaptcha"
                                        sitekey="6Led6F4mAAAAAIIRJtaTD4268AC7dvhkOEsd_oub"
                                        {...field}
                                        ref={recaptchaRef}
                                    />

                                </FormControl>
                                <FormMessage />
                            </FormItem>

                        )}
                    />

                    <Button type="submit" className="float-right">Login</Button>
                    <Button className="float-left" variant="secondary" onClick={toLogin}>Not registered?</Button>
                </form>
            </Form>
        </>
    )
}

export function LoginForm() {
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

            <LogForm />

        </>
    )
}