"use client"

import React from 'react'
import { cn } from '@/shared/lib/utils'

interface BrandLogoProps {
    name: string
    className?: string
}

// Langsung export default di depan function
const BrandLogo = ({ name = "", className }: BrandLogoProps) => {
    const upperName = name.toUpperCase();
    const isLKSDUEL = upperName.includes("LKSDUEL") || upperName.includes("LKS");

    if (isLKSDUEL) {
        if (upperName === "LKSDUEL" || upperName === "LKSDUEL") {
            return (
                <span className={cn("font-black tracking-tighter uppercase", className)}>
                    <span className="text-gray-900 dark:text-white">LKS</span>
                    <span className="text-blue-600 dark:text-blue-400 drop-shadow-[0_0_8px_rgba(37,99,235,0.3)]">DUEL</span>
                </span>
            );
        }
        
        if (upperName.includes("LKS")) {
            return (
                <span className={cn("font-black tracking-tighter uppercase flex items-center gap-1.5", className)}>
                    <span className="text-gray-900 dark:text-white">LKS</span>
                    <span className="text-blue-600 dark:text-blue-400 drop-shadow-[0_0_8px_rgba(37,99,235,0.3)]">DUEL</span>
                </span>
            );
        }
    }

    return (
        <span className={cn("text-blue-600 dark:text-blue-500 font-black tracking-tighter uppercase", className)}>
            {name}
        </span>
    );
};

BrandLogo.displayName = 'BrandLogo';

export default BrandLogo;
