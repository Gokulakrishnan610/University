import { Enabled, QueryFunction, QueryKey, useQuery } from "@tanstack/react-query";

export const useQueryData = (queryKey: QueryKey, queryFn: QueryFunction, enabled?: Enabled) => {
    const { data, isPending, isFetched, refetch, isFetching } = useQuery({ queryKey, queryFn, enabled })
    // staleTime: 1000 * 60 * 60
    return { data, isPending, isFetched, refetch, isFetching }
}