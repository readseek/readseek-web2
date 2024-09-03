/**
 * 负责service分发，处理标准网络协议请求、Cookie验证等逻辑
 */
import { fileUpload, fileDelete } from "@/service/file";
import { home, list, userUpdate } from "@/service/system";

async function index(request?: Request) {
  return new Response(JSON.stringify({ message: "Default Action Called!" }), {
    status: 200,
  });
}

export async function GET(request: Request, { params }: RouteContext) {
  const { action } = params;
  const routes: any = {
    index,
    home,
    list,
  };

  if (routes[action]) {
    return routes[action](request);
  }
  return routes.index(request);
}

export async function POST(request: Request, { params }: RouteContext) {
  const { action } = params;
  const routes: any = {
    fileUpload,
    fileDelete,
    userUpdate,
  };

  if (routes[action]) {
    return routes[action](request);
  } else {
    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
    });
  }
}
