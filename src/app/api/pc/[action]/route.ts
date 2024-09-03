/**
 * 负责service分发，处理标准网络协议请求、Cookie验证等逻辑
 */
import { fileUpload, fileDelete } from "@/service/file";
import { home, list, userUpdate } from "@/service/system";

/**
 * 处理错误请求
 */
async function error(request?: Request) {
  return new Response(JSON.stringify({ message: "Action error ..." }), {
    status: 403,
  });
}

export async function GET(request: Request, { params }: RouteContext) {
  const { action } = params;
  const routes: any = {
    error,
    home,
    list,
  };

  if (routes[action]) {
    return routes[action](request);
  }
  return routes.error(request);
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
