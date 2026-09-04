interface ApiErrorBody {
  success: false;
  message: string;
  errors?: { path: string; message: string }[];
}

// RTK Query's fetchBaseQuery reports a request that never reached the server (offline,
// DNS failure, backend down, CORS misconfiguration) or one that timed out with a `status`
// of "FETCH_ERROR"/"TIMEOUT_ERROR" and no `data` — the raw `error` string in that case is a
// low-level message (e.g. "TypeError: Failed to fetch") that isn't meaningful to an admin.
const NETWORK_ERROR_STATUSES = new Set(["FETCH_ERROR", "TIMEOUT_ERROR"]);

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "string" && NETWORK_ERROR_STATUSES.has(status)) {
      return "Unable to reach the server. Check your connection and try again.";
    }
  }
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: ApiErrorBody }).data;
    if (data?.message) return data.message;
  }
  if (error && typeof error === "object" && "error" in error) {
    const message = (error as { error?: string }).error;
    if (message) return message;
  }
  return "Something went wrong. Please try again.";
}
