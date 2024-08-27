import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "通知中心 - 如何看待",
};

export default async function Messages() {
  return <main className="flex flex-col bg-blue-300">消息中心</main>;
}
