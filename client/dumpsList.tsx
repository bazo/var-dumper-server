import type { DumpData } from "./types";

interface DumpsListProps {
	dumps: DumpData["dumps"];
	onClick: (dump: DumpData["dumps"][0]) => void;
	selectedId: number | undefined;
}

const formatter = new Intl.DateTimeFormat(navigator.language ?? "en", {
	dateStyle: "long",
	timeStyle: "medium",
	timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
});

export function DumpsList({ dumps = [], selectedId, onClick }: DumpsListProps) {
	return (
		<ul role="list" className="divide-y divide-gray-100">
			{dumps.map((dump) => {
				const time = new Date(dump.context.timestamp * 1000);
				return (
					<li
						key={dump.id}
						className={`flex justify-between gap-x-6 pt-5 pb-5 pl-10 pr-10 cursor-pointer hover:bg-blue-100${
							selectedId === dump.id ? " bg-blue-100" : ""
						}`}
						onClick={() => {
							onClick(dump);
						}}
					>
						{/* <div>
							{dump.id}
						</div> */}
						<div className="min-w-0 flex-auto">
							<p>
								<span className="text-sm font-semibold leading-6 text-gray-900 mr-2">{dump.context.request?.method ?? "CLI"}</span>
								<span className="text-sm font-medium leading-6 text-gray-700">{dump.context.request?.uri}</span>
							</p>
							<p className="mt-1 truncate text-xs leading-5 text-gray-500">
								<time dateTime={time.toString()}>{formatter.format(time)}</time>
							</p>
						</div>
						<div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
							<p className="text-sm leading-6 text-gray-900">
								{dump.context.request ? dump.context.request.controller : dump.context.cli?.command_line}
							</p>
							<p className="mt-1 text-xs leading-5 text-gray-500">{dump.context.source.file_relative ?? dump.context.source.name}</p>
						</div>
					</li>
				);
			})}
		</ul>
	);
}
