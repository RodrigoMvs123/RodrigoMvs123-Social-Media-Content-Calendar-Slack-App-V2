import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slack, ExternalLink, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface SlackStatusResponse {
  connected: boolean;
  channelConfigured: boolean;
  tokenConfigured: boolean;
}

const SlackSettings = () => {
  const [botToken, setBotToken] = useState('');
  const [channelId, setChannelId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const { data: slackStatus, isLoading, refetch } = useQuery({
    queryKey: ['/api/slack/status'],
    queryFn: async () => {
      const response = await fetch('/api/slack/status');
      if (!response.ok) {
        throw new Error('Failed to fetch Slack status');
      }
      return response.json() as Promise<SlackStatusResponse>;
    }
  });

  // This would be a real API call in production
  const handleSaveSettings = async () => {
    // In a real app, this would be a POST request to save the settings
    setIsSaving(true);
    try {
      // Simulating API request
      toast({
        title: "Settings Saved",
        description: "Your Slack integration settings have been updated. These would be saved to environment variables in production.",
      });
      await refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Slack className="h-5 w-5" />
          Slack Integration
        </CardTitle>
        <CardDescription>
          Connect your calendar to Slack for notifications when posts are scheduled.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="bot-token" className="flex-grow">Bot Token</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-80 text-sm">
                    A Bot Token allows this app to send messages to your Slack workspace. 
                    You can create one in the Slack API dashboard under "OAuth & Permissions".
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="bot-token"
            type="password"
            placeholder="xoxb-..."
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
          />
          {slackStatus?.tokenConfigured && (
            <p className="text-xs text-green-600">✓ Token configured in environment</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="channel-id" className="flex-grow">Channel ID</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-80 text-sm">
                    The Channel ID is where notifications will be sent. 
                    Right-click on a channel in Slack and select "Copy Link" to find this.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="channel-id"
            placeholder="C04HL619LG"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
          />
          {slackStatus?.channelConfigured && (
            <p className="text-xs text-green-600">✓ Channel configured in environment</p>
          )}
        </div>

        <div className="pt-2">
          <Button
            asChild
            variant="link"
            className="h-auto p-0 text-sm text-gray-500"
          >
            <a
              href="https://api.slack.com/apps"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              Open Slack API Dashboard
            </a>
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div>
          {slackStatus?.connected && (
            <span className="text-sm text-green-600">✓ Connected to Slack</span>
          )}
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SlackSettings;