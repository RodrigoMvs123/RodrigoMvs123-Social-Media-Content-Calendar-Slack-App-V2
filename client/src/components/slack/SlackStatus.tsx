import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Slack as SlackIcon, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface SlackStatusProps {
  className?: string;
}

interface SlackStatusResponse {
  connected: boolean;
  channelConfigured: boolean;
  tokenConfigured: boolean;
}

const SlackStatus = ({ className }: SlackStatusProps) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/slack/status'],
    queryFn: async () => {
      const response = await fetch('/api/slack/status');
      if (!response.ok) {
        throw new Error('Failed to fetch Slack status');
      }
      return response.json() as Promise<SlackStatusResponse>;
    }
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <SlackIcon className="h-5 w-5 text-slate-400 animate-pulse" />
            <span className="text-sm text-slate-500">Checking Slack connection...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Connection Error</AlertTitle>
        <AlertDescription>
          Unable to check Slack integration status. 
          <Button variant="link" onClick={() => refetch()} className="p-0 h-auto text-xs font-normal underline">
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  if (data.connected) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SlackIcon className="h-5 w-5 text-[#4A154B]" />
              <span className="text-sm font-medium">Slack Integration</span>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="mr-1 h-3 w-3" />
              Connected
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Alert className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Slack Integration Incomplete</AlertTitle>
      <AlertDescription>
        {!data.tokenConfigured && !data.channelConfigured ? (
          "Slack bot token and channel ID are missing. Contact your administrator to complete the setup."
        ) : !data.tokenConfigured ? (
          "Slack bot token is missing. Contact your administrator to complete the setup."
        ) : (
          "Slack channel ID is missing. Contact your administrator to complete the setup."
        )}
      </AlertDescription>
    </Alert>
  );
};

export default SlackStatus;