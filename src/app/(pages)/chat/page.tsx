import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '交流中心 - 搜读',
};

export default async function ChatPage() {
    return <main className="flex flex-col bg-slate-400">交流中心</main>;
}
