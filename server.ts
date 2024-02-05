import { serve } from "bun";
import { Database } from "bun:sqlite";
const db = new Database("db/dumps.sqlite");

const corsHeaders: Bun.HeadersInit = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Headers": "*",
};

function addCorsHeaders(response: Response): Response {
	for (const [header, value] of Object.entries(corsHeaders)) {
		response.headers.set(header, value);
	}

	return response;
}

const perPage = 20;

const server = serve({
	hostname: "0.0.0.0",
	port: 9876,
	fetch(request, server) {
		const url = new URL(request.url);

		if (request.method === "OPTIONS") {
			const response = new Response("", {
				status: 200,
			});

			return addCorsHeaders(response);
		}

		if (url.pathname.startsWith("/publish")) {
			const id = url.searchParams.get("id");
			if (id) {
				server.publish("dumps", id.toString());
			}
			const response = new Response("ok", {
				status: 200,
			});
			return addCorsHeaders(response);
		}

		if (url.pathname.startsWith("/api")) {
			let res = null;
			if (url.searchParams.has("page")) {
				const page = Number.parseInt(url.searchParams.get("page") ?? "1");
				const offset = (page - 1) * perPage;

				const countQuery = db.query("select count(*) as count from dumps");
				const { count } = countQuery.get() as { count: number };

				const pages = Math.ceil(count / perPage);

				const query = db.query("select * from dumps order by created_at desc limit $limit offset $offset ");
				const dumps = query.all({
					$limit: perPage,
					$offset: offset,
				});

				return addCorsHeaders(
					Response.json({
						total: count,
						pages,
						dumps,
					}),
				);
			}

			if (url.searchParams.has("id")) {
				const id = Number.parseInt(url.searchParams.get("id") ?? "0");
				const query = db.query("select * from dumps where id = $id ");
				res = query.get({
					$id: id,
				});
			}

			return addCorsHeaders(Response.json(res));
		}

		console.log("upgrading connection");
		if (server.upgrade(request)) {
			return;
		}

		return new Response("Upgrade failed :(", { status: 500 });
	},
	websocket: {
		open(ws) {
			ws.subscribe("dumps");
		},
		message(ws, message) {
			console.log(message);
		},
	},
});

console.log(`Server listening on ${server.hostname}:${server.port}`);
