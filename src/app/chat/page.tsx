import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "交流中心 - 如何看待",
};

export default async function ChatMain() {
  return <main className="flex flex-col bg-slate-400">交流中心</main>;
}
