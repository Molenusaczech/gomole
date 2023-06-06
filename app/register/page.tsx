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
import { RegisterForm } from "@/components/login/registerForm";

export default function App() {
    return (
        <>
            <div className="grid grid-cols-6 gap-4">
                <div className="col-span-1">
                    <Sidebar curSelected="3" />
                </div>
                <div className="col-span-5">
                    {/*<Label className="mb-1"> Guest Login </Label>
                    <GuestInput />*/}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '90vh',
                    }}>
                        <RegisterForm />
                    </div>
                </div>
                {/*<LoginForm />*/}

            </div>

        </>
    )
}


