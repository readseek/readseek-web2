export const home = async () => {
    return new Response(JSON.stringify({ message: "Get HomeData Called!" }), {
        status: 200,
      });
}

export const list = async () => {
    return new Response(JSON.stringify({ message: "Book list Called!" }), {
        status: 200,
      });
}


export const userLogin = async () => {
    return new Response(JSON.stringify({ message: "userLogin Called!" }), {
        status: 200,
      });
}

export const userUpdate = async () => {
    return new Response(JSON.stringify({ message: "userUpdate Called!" }), {
        status: 200,
      });
}

export const userDelete = async () => {
    return new Response(JSON.stringify({ message: "userDelete Called!" }), {
        status: 200,
      });
}