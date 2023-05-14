import {
    User,
    PlayCircle,
    Home,
    Eye,
    Key,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import Link from "next/link"



export function Sidebar({ curSelected }) {

    let selectClasses: ("secondary" | "ghost" | "link" | "default" | "destructive" | "outline" | null | undefined)[] = [];

    for (let i = 0; i < 4; i++) {
        if (i == curSelected) {
            selectClasses[i] = "secondary";
        } else {
            selectClasses[i] = "ghost";
        }
    }

    return (
        //<div className="sideBarContainer">
        <div className={cn("pb-12")}>
            <div className="space-y-4 py-4">
                <div className="px-4 py-2">
                    <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                        Gomoku
                    </h2>
                    <div className="space-y-1">
                        <Link href="/">
                            <Button
                                variant={selectClasses[0]}
                                size="sm"
                                className="w-full justify-start"
                            >
                                <Home className="mr-2 h-4 w-4" />
                                Home
                            </Button>
                        </Link>
                        <Link href="/play">
                            <Button
                                variant={selectClasses[1]} size="sm" className="w-full justify-start"
                            >
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Play
                            </Button>
                        </Link>
                        <Button variant={selectClasses[2]} size="sm" className="w-full justify-start">
                            <User className="mr-2 h-4 w-4" />
                            My Profile
                        </Button>
                        <Link href="/login">
                            <Button variant={selectClasses[3]} size="sm" className="w-full justify-start">
                                <Key className="mr-2 h-4 w-4" />
                                Login
                            </Button>
                        </Link>
                    </div>
                </div>


            </div>
        </div>
        //</div>
    )
}