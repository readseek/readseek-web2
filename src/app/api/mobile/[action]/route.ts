async function index(request?: Request) {
  return new Response(JSON.stringify({ message: "Default GET Called!" }), {
    status: 200,
  });
}

async function home(request?: Request) {
  return new Response(JSON.stringify({ message: "Get HomeData Called!" }), {
    status: 200,
  });
}

// Main GET handler
export async function GET(request: Request, { params }: RouteContext) {
  const { action } = params;
  const routes: any = {
    index,
    home,
  };

  if (!action) {
    return new Response(JSON.stringify({ error: "Action Not Found" }), {
      status: 404,
    });
  }

  if (routes[action]) {
    return routes[action](request);
  }
  return routes.index(request);
}
