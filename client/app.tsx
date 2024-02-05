import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { DumpDataSchema, DumpSchema, type Dump } from "./types";
import { DumpsList } from "./dumpsList";
import { connectWs } from "./ws";
import Pagination from "./pagination";
import { Loader } from "./loader";

const getData = async (page: number) => {
	const res = await fetch(`/api?page=${page}`, {
		mode: "cors",
	});
	const json = await res.json();
	return DumpDataSchema.parse(json);
};

const getDump = async (id: number) => {
	const res = await fetch(`/api?id=${id}`, {
		mode: "cors",
	});
	const json = await res.json();
	return DumpSchema.parse(json);
};

export function App() {
	const socket = useRef<WebSocket>();

	const [page, setPage] = useState(() => {
		const url = new URL(location.href);
		return Number.parseInt(url.searchParams.get("page") ?? "1");
	});

	const [selected, select] = useState<Dump | null>(null);

	const { data, isFetching, refetch } = useQuery({ queryKey: ["dumps", page], queryFn: () => getData(page) });

	// const data = undefined
	// const isFetching = true;
	// const refetch = () => {};

	useEffect(() => {
		if (socket.current) {
			return;
		}

		socket.current = connectWs({
			url: `ws://${location.host}`,
			async onMessage(event) {
				//const dump = await getDump(Number.parseInt(event.data));
				refetch();
			},
		});

		return () => {
			socket.current?.close();
		};
	}, [refetch]);

	useEffect(() => {
		if (!data?.dumps[0]) {
			return;
		}
		select(data.dumps[0]);
	}, [data?.dumps[0]]);

	const handlePageChange = (page: number) => {
		const url = new URL(location.href);
		url.searchParams.set("page", page.toString());
		window.history.pushState(undefined, "", url);

		setPage(page);
	};

	return (
		<div className="w-full pt-3 pb-3 h-screen">
			<div className="fixed left-0 right-0">
				<h1 className="text-center text-xl">VarDumps</h1>
			</div>
			<div className="flex h-full">
				<div className="w-1/3 pt-10 pb-10 overflow-y-auto h-full">
					{data?.dumps ? (
						<>
							<DumpsList dumps={data.dumps} selectedId={selected?.id} onClick={select} />
							<Pagination count={data.dumps.length} perPage={20} page={page} pages={data.pages} totalResults={data.total} onPageChange={handlePageChange} />
						</>
					) : isFetching ? (
						<div className="flex flex-col justify-center h-full">
							<div className="text-center">
							<Loader />
							</div>
						</div>
					) : null}
				</div>
				<div className="w-2/3 p-10 overflow-y-auto h-full">
					{selected ? <iframe srcDoc={atob(selected.html)} className="w-full h-full" /> : null}
				</div>
			</div>
		</div>
	);
}
