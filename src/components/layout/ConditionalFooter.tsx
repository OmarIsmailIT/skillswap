'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function ConditionalFooter() {
    const pathname = usePathname();

    // Don't show footer on user profile pages
    if (pathname?.startsWith('/users/')) {
        return null;
    }

    return <Footer />;
}
