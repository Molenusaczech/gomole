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

function GuestInput() {

    const guestRef = useRef<HTMLInputElement>(null);

    function guestLogin() {
        console.log("guest login");

        if (guestRef.current == null) {
            return;
        }

        console.log("guest_" + guestRef.current.value);
        let username = guestRef.current.value;
        if (username == "") {
            alert("Please enter a username");
            return;
        }

        setCookie("username", "guest_" + username, 365);
        alert("Logged in as guest_" + username);
        location.reload();

    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            guestLogin();
        }
    };

    return (
        <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
                type="text"
                placeholder="Guest Username"
                ref={guestRef}
                onKeyDown={handleKeyDown}
            />
            <Button type="submit" onClick={guestLogin}>Login</Button>
        </div>
    )
}


export default function App() {
    return (
        <>
            <div className="grid grid-cols-6 gap-4">
                <div className="col-span-1">
                    <Sidebar curSelected="3" />
                </div>
                <div className="col-span-5">
                    <Label className="mb-1"> Guest Login </Label>
                    <GuestInput />
                </div>
            </div>
        </>
    )
}


