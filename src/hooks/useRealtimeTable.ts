import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";

export interface RealtimeTableOptions<T> {
  filterField?: string | null; // Set to null to subscribe without client-side filter (relying on RLS)
  orderByField?: string;
  orderDescending?: boolean;
  mapRow?: (row: any) => T;
  guestData?: T[];
}

export function useRealtimeTable<T extends { id: string | number }>(
  tableName: string,
  userId: string | null,
  options: RealtimeTableOptions<T> = {}
) {
  const [data, setData] = useState<T[]>(() => options.guestData || []);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use refs for dynamic options to avoid re-triggering the subscription effect unnecessarily
  const mapRowRef = useRef(options.mapRow);
  mapRowRef.current = options.mapRow;

  const guestDataRef = useRef(options.guestData);
  guestDataRef.current = options.guestData;

  useEffect(() => {
    if (!userId) {
      setData(guestDataRef.current || []);
      setIsLoading(false);
      return;
    }

    const filterField = options.filterField !== undefined ? options.filterField : "user_id";
    const orderByField = options.orderByField;
    const orderDescending = options.orderDescending ?? false;
    const mapper = mapRowRef.current || ((row: any) => row as T);

    const fetchData = async () => {
      setIsLoading(true);
      try {
        let query = supabase.from(tableName).select("*");
        if (filterField) {
          query = query.eq(filterField, userId);
        }
        if (orderByField) {
          query = query.order(orderByField, { ascending: !orderDescending });
        }
        const { data: result, error } = await query;
        if (error) throw error;
        if (result) {
          setData(result.map(mapper));
        }
      } catch (err) {
        console.error(`Error loading ${tableName} data:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Subscribe to realtime changes
    const filterString = filterField ? `${filterField}=eq.${userId}` : undefined;
    
    const channel = supabase
      .channel(`rt-${tableName}-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName,
          filter: filterString
        },
        (payload) => {
          const mapper = mapRowRef.current || ((row: any) => row as T);
          
          if (payload.eventType === "INSERT") {
            const newRow = mapper(payload.new);
            setData((prev) => {
              if (prev.some((row) => row.id === newRow.id)) return prev;
              // Prepend new row
              return [newRow, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            const updatedRow = mapper(payload.new);
            setData((prev) =>
              prev.map((row) => (row.id === updatedRow.id ? updatedRow : row))
            );
          } else if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id;
            setData((prev) => prev.filter((row) => row.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, userId, options.filterField, options.orderByField, options.orderDescending]);

  return { data, setData, isLoading };
}
