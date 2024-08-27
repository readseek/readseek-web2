import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "控制台 - 如何看待",
};

export default async function Console() {
  return <main className="flex flex-col bg-green-600">控制台</main>;
}
