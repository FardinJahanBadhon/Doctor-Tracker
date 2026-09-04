interface ApiErrorBody {
  success: false;
  message: string;
  errors?: { path: string; message: string }[];
}

export function getErrorMessage(error: unknown): string {
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
