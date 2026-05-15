"use client"

import React from 'react'
import { cn } from '@/shared/lib/utils'

interface BrandLogoProps {
    name: string
    className?: string
}

// Langsung export default di depan function
const BrandLogo = ({ name = "", className }: BrandLogoProps) => {
    const isPhoenix = name.toUpperCase().includes("PHOENIX");

    if (isPhoenix) {
        return (
            <span className={cn("font-black tracking-tighter uppercase", className)}>
                <span className="text-gray-900 dark:text-white transition-colors">
                    PHOENIX
                </span>
                <span className="text-blue-600 dark:text-blue-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)] ml-1">
                    ARENA
                </span>
            </span>
        );
    }

    return (
        <span className={cn("text-blue-600 dark:text-blue-500 font-black tracking-tighter uppercase", className)}>
            {name}
        </span>
    );
};

BrandLogo.displayName = 'BrandLogo';

export default BrandLogo;
