// components/EventErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class EventErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <AlertDialog open>
          <AlertDialogContent>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Произошла ошибка при загрузке события
              </h2>
              <p className="text-muted-foreground mb-4">
                {this.state.error?.message}
              </p>
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    this.setState({ hasError: false, error: null })
                  }
                >
                  Попробовать снова
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Перезагрузить страницу
                </Button>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    return this.props.children;
  }
}
