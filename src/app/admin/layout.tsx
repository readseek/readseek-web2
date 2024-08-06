import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "控制台 - 如何看待",
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <html lang="en">
      <body className={"min-h-full min-w-full flex-1 bg-slate-600"}>
        {children}
      </body>
    </html>
  );
}
