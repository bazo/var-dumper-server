interface PaginationProps {
	page: number;
	pages: number;
	totalResults: number;
	onPageChange: (page: number) => void;
	count: number;
	perPage: number;
}

export default function Pagination({ page, pages, totalResults, count, perPage, onPageChange }: PaginationProps) {
	const handlePrevious = () => {
		const newPage = Math.max(page - 1, 1);
		onPageChange(newPage);
	};

	const handleNext = () => {
		const newPage = Math.min(page + 1, pages);
		onPageChange(newPage);
	};

	const start = Math.min((page - 1) * perPage + 1, totalResults);
	const end = Math.max(start + Math.min(count, perPage) - 1, 0);

	return (
		<nav className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6" aria-label="Pagination">
			<div className="hidden sm:block">
				<p className="text-sm text-gray-700">
					Showing <span className="font-medium">{start}</span> to <span className="font-medium">{end}</span> of{" "}
					<span className="font-medium">{totalResults}</span> results
				</p>
			</div>
			<div className="flex flex-1 justify-between sm:justify-end">
				{page > 1 ? (
					<a
						className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 cursor-pointer"
						onClick={handlePrevious}
					>
						Previous
					</a>
				) : null}
				{page < pages ? (
					<a
						className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 cursor-pointer"
						onClick={handleNext}
					>
						Next
					</a>
				) : null}
			</div>
		</nav>
	);
}
