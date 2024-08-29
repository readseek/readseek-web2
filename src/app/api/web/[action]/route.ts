

async function hello(request) {
  return new Response(JSON.stringify({ message: 'Hello Called!' }), {
    status: 200,
  });
}

// Main GET handler
export async function GET(request, { params }) {
  
  console.log('api/user ===>', params)
  
  const { action } = params;
  const routes = {
    hello
  };

  // Check if the function exists and call it
  if (routes[action]) {
    return routes[action](request);
  } else {
    return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
  }
}