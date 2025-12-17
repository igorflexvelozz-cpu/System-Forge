import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion, Upload, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  testId?: string;
}

export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  action,
  secondaryAction,
  testId
}: EmptyStateProps) {
  const ActionIcon = action?.icon || Upload;

  return (
    <Card data-testid={testId}>
      <CardContent className="py-12">
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          <div className="p-4 bg-muted rounded-full mb-4">
            <Icon className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-6">{description}</p>
          <div className="flex items-center gap-3">
            {action && (
              <Button onClick={action.onClick} className="gap-2" data-testid="button-empty-action">
                <ActionIcon className="w-4 h-4" />
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant="outline"
                onClick={secondaryAction.onClick}
                className="gap-2"
                data-testid="button-empty-secondary"
              >
                <RefreshCw className="w-4 h-4" />
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
