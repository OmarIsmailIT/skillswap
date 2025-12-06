import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "User Profile - SkillSwap",
};

export default function UsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Custom layout without footer - just the page content
    return <>{children}</>;
}
