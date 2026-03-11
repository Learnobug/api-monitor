import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchApis,
  fetchApiById,
  fetchApiChecks,
  fetchDashboardStats,
  createApi,
  fetchAlerts,
  createAlert,
  deleteAlert,
  toggleAlert,
  triggerCheck,
  triggerCheckAll,
  fetchAlertLogs,
  deleteApi,
  fetchAllChecks,
} from "../services/api";

export function useApis() {
  return useQuery({
    queryKey: ["apis"],
    queryFn: fetchApis,
  });
}

export function useApi(id: string) {
  return useQuery({
    queryKey: ["apis", id],
    queryFn: () => fetchApiById(id),
    enabled: !!id,
  });
}

export function useApiChecks(apiId: string) {
  return useQuery({
    queryKey: ["api-checks", apiId],
    queryFn: () => fetchApiChecks(apiId),
    enabled: !!apiId,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });
}

export function useCreateApi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apis"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useToggleAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      toggleAlert(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useTriggerCheck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: triggerCheck,
    onSuccess: (_data, apiId) => {
      queryClient.invalidateQueries({ queryKey: ["api-checks", apiId] });
      queryClient.invalidateQueries({ queryKey: ["apis", apiId] });
    },
  });
}

export function useAlertLogs() {
  return useQuery({
    queryKey: ["alert-logs"],
    queryFn: fetchAlertLogs,
  });
}

export function useDeleteApi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apis"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useTriggerCheckAll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: triggerCheckAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apis"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["all-checks"] });
    },
  });
}

export function useAllChecks() {
  return useQuery({
    queryKey: ["all-checks"],
    queryFn: fetchAllChecks,
  });
}
