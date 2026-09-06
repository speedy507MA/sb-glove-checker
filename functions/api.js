// This file automatically maps to ://yourwebsite.com
export async function onRequest(context) {
    // context.env contains your service bindings!
    const { env, request } = context;

    // Forward the incoming request straight to your bound worker
    return await env['sb-glove-checker'].fetch(request);
}