import type { Metadata } from "next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "内容发布 - 如何看待",
};

export default async function PostContentPage() {
  return (
    <main className="flex flex-col items-center pt-24">
      <div className="flex h-24 w-1/3 items-center justify-start">
        <Label htmlFor="picture" className="w-28 text-lg">
          上传文档：
        </Label>
        <Input
          id="bookFile"
          type="file"
          accept=".doc,.docx,.pdf,.txt"
          className="w-1/2"
        />
      </div>

      <div className="flex h-24 w-1/3 items-center justify-start">
        <Label htmlFor="picture" className="w-28 text-lg">
          内容标签：
        </Label>
        <Select>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="选择一个大致的类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="apple">科学技术</SelectItem>
              <SelectItem value="banana">历史人文</SelectItem>
              <SelectItem value="blueberry">金融理财</SelectItem>
              <SelectItem value="grapes">语言学习</SelectItem>
              <SelectItem value="pineapple">小说杂文</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex h-24 w-1/3 items-center justify-start">
        <Button type="submit">
          <UploadCloud className="mr-2 h-4 w-4" /> 提交
        </Button>
      </div>
    </main>
  );
}
