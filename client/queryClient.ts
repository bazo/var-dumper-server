import { QueryClient as BaseClient } from "@tanstack/react-query";

const queryClient = new BaseClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: true,
		},
	},
});

export default queryClient;
export type QueryClient = typeof queryClient;
