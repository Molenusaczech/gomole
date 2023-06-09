"use client";

import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import React from 'react';
import { BrowserRouter as Router, Routes, Route }
  from 'react-router-dom';

export default function App() {
  return (
    <>
      <div className="grid grid-cols-6 gap-4">
      <div className="col-span-1">
        <Sidebar curSelected="0" />
        </div>
      </div>
    </>
  )
}


