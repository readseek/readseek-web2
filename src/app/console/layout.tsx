import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "控制台 - 如何看待",
};

interface ConsoleLayoutProps {
  children: React.ReactNode;
}

export default async function ConsoleLayout({ children }: ConsoleLayoutProps) {
  return (
    <html lang="en">
      <body className={"min-h-full min-w-full flex-1 bg-slate-600"}>
        {children}
      </body>
    </html>
  );
}
