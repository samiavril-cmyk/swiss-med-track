import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Wifi, 
  WifiOff,
  RefreshCw,
  Clock
} from 'lucide-react';

interface HealthStatus {
  isOnline: boolean;
  isHealthy: boolean;
  lastCheck: number;
  responseTime: number;
  errorCount: number;
  retryCount: number;
  circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  cacheStats: {
    size: number;
    keys: string[];
  };
}

interface AuthHealthMonitorProps {
  healthStatus: HealthStatus;
  onRefresh: () => void;
  onRetry: () => void;
  className?: string;
}

export const AuthHealthMonitor: React.FC<AuthHealthMonitorProps> = ({
  healthStatus,
  onRefresh,
  onRetry,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    if (!healthStatus.isOnline) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
    if (!healthStatus.isHealthy) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (healthStatus.errorCount > 0) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (!healthStatus.isOnline) return 'Offline';
    if (!healthStatus.isHealthy) return 'Backend Error';
    if (healthStatus.errorCount > 0) return 'Degraded';
    return 'Healthy';
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (!healthStatus.isOnline || !healthStatus.isHealthy) return 'destructive';
    if (healthStatus.errorCount > 0) return 'secondary';
    return 'default';
  };

  const formatTimestamp = (timestamp: number) => {
    if (timestamp === 0) return 'Nie';
    return new Date(timestamp).toLocaleTimeString('de-DE');
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (!isExpanded) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2"
        >
          {getStatusIcon()}
          <span className="text-xs">{getStatusText()}</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Card className="w-80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Auth Health Monitor
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Status Overview */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">{getStatusText()}</span>
            </div>
            <Badge variant={getStatusVariant()}>
              {healthStatus.isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>

          {/* Connection Status */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Letzte Prüfung:</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimestamp(healthStatus.lastCheck)}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Antwortzeit:</span>
              <div>{formatResponseTime(healthStatus.responseTime)}</div>
            </div>
          </div>

          {/* Error Stats */}
          {(healthStatus.errorCount > 0 || healthStatus.retryCount > 0) && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Fehlerstatistiken:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Fehler: {healthStatus.errorCount}</div>
                <div>Wiederholungen: {healthStatus.retryCount}</div>
              </div>
            </div>
          )}

          {/* Circuit Breaker Status */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Circuit Breaker:</div>
            <Badge 
              variant={
                healthStatus.circuitBreakerState === 'OPEN' ? 'destructive' :
                healthStatus.circuitBreakerState === 'HALF_OPEN' ? 'secondary' : 'default'
              }
              className="text-xs"
            >
              {healthStatus.circuitBreakerState}
            </Badge>
          </div>

          {/* Cache Stats */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Cache:</div>
            <div className="text-xs">
              {healthStatus.cacheStats.size} Einträge
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={!healthStatus.isOnline}
              className="flex-1"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Reload
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
