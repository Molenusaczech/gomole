"use client";

import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import { Game } from "@/components/games/game"


export default function App() {
  return (
    <>
      <div className="grid grid-cols-6 gap-4">
        <div className="col-span-1">
          <Sidebar curSelected="1" />
        </div>
        <div className="col-span-5">

          <Game />
        </div>
      </div>
    </>
  )
}


