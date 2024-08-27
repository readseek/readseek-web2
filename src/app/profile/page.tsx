import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "用户中心 - 如何看待",
};

export default async function Profile() {
  return <main className="flex flex-col bg-yellow-200">用户设置中心</main>;
}
