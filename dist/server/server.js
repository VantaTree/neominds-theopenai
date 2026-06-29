//#region src/server.ts
var server_default = { async fetch(request, env, ctx) {
	const { default: handler } = await import("./assets/server-D-QAmn9o.js");
	return handler.fetch(request, env, ctx);
} };
//#endregion
export { server_default as default };
