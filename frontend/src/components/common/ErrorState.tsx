import { AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Something went wrong.", onRetry }: ErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertTriangle />
      <AlertTitle>Couldn&apos;t load this data</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
            Try again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
