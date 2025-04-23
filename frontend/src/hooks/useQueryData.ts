import {  QueryKey, useQuery } from "@tanstack/react-query";

export const useQueryData = <TData = unknown>(
  queryKey: QueryKey, 
  queryFn: () => Promise<TData>, 
  enabled: boolean = true
) => {
    const { data, isPending, isFetched, refetch, isFetching } = useQuery({
      queryKey,
      queryFn,
      enabled,
    })
    // staleTime: 1000 * 60 * 60
    return { data, isPending, isFetched, refetch, isFetching }
}