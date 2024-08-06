import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "用户登录 - 如何看待",
};

interface UserLayoutProps {
  children: React.ReactNode;
}

export default async function UserLayout({ children }: UserLayoutProps) {
  return (
    <html lang="en">
      <body className={"flex-1 bg-slate-600"}>{children}</body>
    </html>
  );
}
