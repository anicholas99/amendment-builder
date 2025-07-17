import React, { useState } from 'react';
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Server,
  Database,
  Cloud,
  Cpu,
  HardDrive,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApiQuery } from '@/lib/api/queryClient';
import { SystemHealth, HealthStatus } from '@/types/health';
import { API_ROUTES } from '@/constants/apiRoutes';
import { systemHealthKeys } from '@/lib/queryKeys/systemKeys';
import AppLayout from '@/components/layouts/AppLayout';
import { LoadingState } from '@/components/common/LoadingState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const getStatusColor = (status: HealthStatus) => {
  switch (status) {
    case 'healthy':
      return 'success';
    case 'degraded':
      return 'warning';
    case 'unhealthy':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getStatusIcon = (status: HealthStatus) => {
  switch (status) {
    case 'healthy':
      return CheckCircle;
    case 'degraded':
      return AlertCircle;
    case 'unhealthy':
      return XCircle;
    default:
      return AlertCircle;
  }
};

const getCheckIcon = (checkName: string) => {
  switch (checkName) {
    case 'database':
      return Database;
    case 'redis':
      return Server;
    case 'external-apis':
      return Cloud;
    case 'memory':
      return Cpu;
    case 'storage':
      return HardDrive;
    default:
      return Server;
  }
};

function formatDuration(ms?: number): string {
  if (!ms) return 'N/A';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export default function SystemHealthPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({});

  const {
    data: health,
    isLoading,
    error,
    refetch,
  } = useApiQuery<SystemHealth>([...systemHealthKeys.all], {
    url: API_ROUTES.MISC.HEALTH,
    params: { detailed: 'true' },
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds when enabled
  });

  const toggleDetails = (name: string) => {
    setOpenDetails(prev => ({ ...prev, [name]: !prev[name] }));
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto max-w-4xl py-8">
          <LoadingState
            variant="spinner"
            size="lg"
            message="Checking system health..."
          />
        </div>
      </AppLayout>
    );
  }

  if (error || !health) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load health status</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const overallStatusColor = getStatusColor(health.status);
  const StatusIcon = getStatusIcon(health.status);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card p-6">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">System Health Monitor</h1>
              <Badge
                variant={overallStatusColor as any}
                className="flex items-center gap-2 px-4 py-1"
              >
                <StatusIcon className="h-4 w-4" />
                <span>{health.status.toUpperCase()}</span>
              </Badge>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button
                variant={autoRefresh ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Last Check</p>
              <p className="text-lg font-semibold">
                {new Date(health.timestamp).toLocaleTimeString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(health.timestamp).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">System Uptime</p>
              <p className="text-lg font-semibold">
                {formatUptime(health.uptime)}
              </p>
              <p className="text-xs text-muted-foreground">
                Since last restart
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Version</p>
              <p className="text-lg font-semibold">v{health.version}</p>
              <p className="text-xs text-muted-foreground">
                Application version
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Checks */}
      <div className="mx-auto max-w-6xl p-6">
        <div className="space-y-6">
          {/* Summary Alert */}
          {health.status !== 'healthy' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>System Issues Detected</AlertTitle>
              <AlertDescription>
                {
                  Object.entries(health.checks).filter(
                    ([_, check]) => check.status !== 'healthy'
                  ).length
                }{' '}
                component(s) are experiencing issues
              </AlertDescription>
            </Alert>
          )}

          {/* Health Check Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(health.checks).map(([name, check]) => {
              const CheckIcon = getCheckIcon(name);
              const statusColor = getStatusColor(check.status);
              const StatusCheckIcon = getStatusIcon(check.status);
              const isOpen = openDetails[name] || false;

              return (
                <Card key={name}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckIcon className="h-5 w-5" />
                        <CardTitle className="text-base capitalize">
                          {name.replace('-', ' ')}
                        </CardTitle>
                      </div>
                      <Badge
                        variant={statusColor as any}
                        className="flex items-center gap-1"
                      >
                        <StatusCheckIcon className="h-3 w-3" />
                        <span>{check.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {check.message && (
                      <p className="text-sm text-muted-foreground">
                        {check.message}
                      </p>
                    )}

                    {check.duration && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Response Time:
                        </span>
                        <code className="text-sm">
                          {formatDuration(check.duration)}
                        </code>
                      </div>
                    )}

                    {check.details && Object.keys(check.details).length > 0 && (
                      <>
                        <div className="border-t pt-3" />
                        <Collapsible
                          open={isOpen}
                          onOpenChange={() => toggleDetails(name)}
                        >
                          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:underline">
                            Details
                            {isOpen ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-2 pt-2">
                            {Object.entries(check.details).map(
                              ([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">
                                    {key}:
                                  </span>
                                  <code className="text-xs">
                                    {typeof value === 'object'
                                      ? JSON.stringify(value, null, 2)
                                      : String(value)}
                                  </code>
                                </div>
                              )
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      </>
                    )}

                    {/* Special handling for memory check */}
                    {(() => {
                      if (
                        name === 'memory' &&
                        check.details &&
                        'heapPercentage' in check.details &&
                        typeof check.details.heapPercentage === 'number'
                      ) {
                        const heapPercentage = check.details
                          .heapPercentage as number;
                        return (
                          <div>
                            <div className="mb-2 flex justify-between">
                              <span className="text-sm">Heap Usage</span>
                              <span className="text-sm">{heapPercentage}%</span>
                            </div>
                            <Progress
                              value={heapPercentage}
                              className={cn(
                                heapPercentage > 90
                                  ? 'bg-destructive'
                                  : heapPercentage > 75
                                    ? 'bg-warning'
                                    : 'bg-success'
                              )}
                            />
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* API Documentation Link */}
          <div className="pt-4">
            <p className="text-center text-sm text-muted-foreground">
              This page automatically refreshes every 30 seconds. For API
              access, use{' '}
              <code className="rounded bg-muted px-1">/api/health</code>{' '}
              endpoint.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
