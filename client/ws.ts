type WebsocketUrl = `w${"s" | "ss"}://${string}`;

export interface WsOptions {
	url: WebsocketUrl;
	onOpen?: WebSocket["onopen"];
	onMessage?: WebSocket["onmessage"];
	onError?: WebSocket["onerror"];
	onClose?: WebSocket["onclose"];
	timeout?: number;
}

export function connectWs({ url, timeout = 250, ...options }: WsOptions) {
	let socket: WebSocket | null = new WebSocket(url);
	let timeoutId: number | null = null;
	let timeoutMs = timeout;

	socket.onopen = (e) => {
		if (options.onOpen && socket) {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			options.onOpen.call(socket, e);
		}
	};
	socket.onmessage = options.onMessage ?? null;
	socket.onerror = options.onError ?? null;

	socket.onclose = (e) => {
		if (options.onClose && socket) {
			options.onClose.call(socket, e);
		}
		timeoutId = setTimeout(() => {
			socket = null;
			timeoutMs += timeoutMs;
			connectWs({ url, ...options });
		}, timeoutMs);
	};

	return socket;
}
