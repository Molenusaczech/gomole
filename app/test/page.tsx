"use client";

import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import { Game } from "@/components/games/game"
import { historyToBoard } from "@/lib/boardRender"


export default function App() {

    let history = {
        "history": { 
            "swap": [[7, 4], [6, 9], [1, 9]], 
            "swap2": [[3, 12], [9, 11]], 
            "moves": [[3, 3], [5, 13], [6, 11], [3, 8], [6, 10], [2, 12], [6, 8], [9, 5], [13, 6], [9, 2], [6, 3], [1, 4], [6, 7]], 
            "choose": "o" 
        }
    }
    let curBoard = historyToBoard(history.history, 20)

    return (
        <>
            {JSON.stringify(curBoard)}
        </>
    )
}


