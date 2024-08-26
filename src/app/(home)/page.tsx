import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {
  return (
    <div className="grid h-screen grid-rows-[5rem_1fr]">
      <header className="sticky top-0 flex h-20 flex-row items-center justify-between bg-blue-200 px-10">
        <Avatar className="w-24">
          <AvatarImage src="logo.png" alt="@ruhekandai" />
          <AvatarFallback>LOGO</AvatarFallback>
        </Avatar>

        <div className="flex w-1/2 items-center space-x-2">
          <Input type="text" placeholder="搜的一下，你就知道" />
          <Button type="submit">搜索</Button>
        </div>
      </header>

      <div className="grid grid-cols-[12rem_1fr]">
        <nav className="center w-48">
          <ul className="grid w-full grid-rows-3 gap-5">
            <li className="h-11 p-2">
              <a href="#home" className="hover:text-white">
                发现
              </a>
            </li>
            <li className="h-11 p-2">
              <a href="#about" className="hover:text-white">
                发布
              </a>
            </li>
            <li className="h-11 p-2">
              <a href="#services" className="hover:text-white">
                通知
              </a>
            </li>
            <li className="h-11 p-2">
              <a href="#contact" className="hover:text-white">
                个人
              </a>
            </li>
          </ul>
        </nav>

        <main className="flex flex-col">
          <div className="flex-1 bg-orange-200">这是信息流</div>
          <footer className="center h-20 bg-gray-600">这是页脚</footer>
        </main>
      </div>
    </div>
  );
}
