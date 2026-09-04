"use client";

import { Stethoscope, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetHealthQuery } from "@/store/api/apiSlice";

export default function Home() {
  const { data, isLoading, isError, error, refetch } = useGetHealthQuery();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Stethoscope size={28} />
      </div>

      <div>
        <h1 className="text-2xl font-bold">Doctor Tracker</h1>
        <p className="mt-1 text-sm text-muted-foreground">Project foundation is set up and ready.</p>
      </div>

      <div className="w-full max-w-md rounded-xl border bg-card p-5 text-left text-sm">
        <p className="mb-3 font-medium text-card-foreground">Backend connection (RTK Query)</p>

        {isLoading && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin" size={16} /> Checking backend health…
          </p>
        )}

        {isError && (
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-2 text-destructive">
              <XCircle size={16} /> Could not reach the backend.
            </p>
            <p className="text-xs text-muted-foreground">
              Make sure the backend is running on the URL set in{" "}
              <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_API_URL</code>.
            </p>
            <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">{JSON.stringify(error, null, 2)}</pre>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="w-fit">
              Retry
            </Button>
          </div>
        )}

        {data && (
          <div className="flex flex-col gap-1">
            <p className="flex items-center gap-2 text-green-600">
              <CheckCircle2 size={16} /> Server {data.server.status}, API {data.api.status}
            </p>
            <p className="text-xs text-muted-foreground">
              MongoDB: <span className="font-medium">{data.database.status}</span>
              {data.database.name && <span> ({data.database.name})</span>}
            </p>
            <p className="text-xs text-muted-foreground">Uptime: {data.server.uptimeSeconds}s</p>
            <p className="text-xs text-muted-foreground">Checked at {new Date(data.timestamp).toLocaleTimeString()}</p>
          </div>
        )}
      </div>
    </main>
  );
}
