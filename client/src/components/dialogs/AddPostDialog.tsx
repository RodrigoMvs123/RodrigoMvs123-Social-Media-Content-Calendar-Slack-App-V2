import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost, generateAIContent, optimizePostContent } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Post } from '@/lib/types';
import { format } from 'date-fns';
import { Sparkles } from 'lucide-react';

interface AddPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: () => void;
}

type Platform = 'Twitter' | 'LinkedIn' | 'Instagram' | 'Facebook';

const AddPostDialog = ({ open, onOpenChange, onPostCreated }: AddPostDialogProps) => {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['Twitter']);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [charCount, setCharCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // Invalidate and refetch calendar posts
      queryClient.invalidateQueries({ queryKey: ['/api/calendar'] });
      
      // Show success toast
      toast({
        title: 'Post scheduled',
        description: 'Your post has been scheduled successfully.',
        variant: 'default',
      });
      
      // Reset form
      resetForm();
      
      // Close dialog
      onOpenChange(false);
      
      // Call onPostCreated callback if provided
      if (onPostCreated) {
        onPostCreated();
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to schedule post: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setContent('');
    setSelectedPlatforms(['Twitter']);
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setTime(format(new Date(), 'HH:mm'));
    setCharCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setCharCount(value.length);
  };

  const handlePlatformToggle = (platform: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };

  const handleSaveDraft = () => {
    handleSubmit('draft');
  };

  const handleSubmit = (status: 'draft' | 'scheduled' = 'scheduled') => {
    // Combine date and time for scheduled time
    const scheduledDate = new Date(`${date}T${time}`);
    
    // Create a post for each selected platform
    selectedPlatforms.forEach(platform => {
      const newPost: Omit<Post, 'id'> = {
        platform,
        content,
        scheduledTime: scheduledDate.toISOString(),
        status,
      };
      
      createPostMutation.mutate(newPost);
    });
  };

  const isPlatformSelected = (platform: Platform) => selectedPlatforms.includes(platform);

  // State for AI content generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPrompt, setGenerationPrompt] = useState('');

  const handleGenerateAI = async () => {
    if (!generationPrompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please enter a topic or idea for the AI to generate content about.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      // Get the first selected platform or default to Twitter
      const platform = selectedPlatforms[0] || 'Twitter';
      
      // Generate content using OpenAI
      const generatedContent = await generateAIContent(generationPrompt, platform);
      
      // Update the content field
      setContent(generatedContent);
      setCharCount(generatedContent.length);
      
      toast({
        title: 'Content Generated',
        description: 'AI-generated content has been added to your post.',
      });
    } catch (error) {
      console.error('Error generating AI content:', error);
      
      // If the API returns an error about quota or API key, show a specific message
      if (error instanceof Error && 
          (error.message.includes('quota') || 
           error.message.includes('API key') || 
           error.message.includes('rate limit'))) {
        toast({
          title: 'OpenAI API Error',
          description: 'There was an issue with the OpenAI API. Please check your API key and quota.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Generation Failed',
          description: error instanceof Error ? error.message : 'Failed to generate content. Try again with a different prompt.',
          variant: 'destructive',
        });
      }
      
      // Generate fallback content based on platform and prompt
      const selectedPlatform = selectedPlatforms[0] || 'Twitter';
      const platformText = selectedPlatform === 'Twitter' ? 'tweet' : 
                          selectedPlatform === 'LinkedIn' ? 'professional post' :
                          selectedPlatform === 'Instagram' ? 'instagram caption' : 'social media post';
                          
      setContent(`Draft ${platformText} about: ${generationPrompt}`);
      setCharCount((`Draft ${platformText} about: ${generationPrompt}`).length);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Create New Post</DialogTitle>
          <DialogDescription>
            Fill in the details of your new social media post.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Platform Selection */}
          <div>
            <Label className="block text-sm font-medium mb-1">Platform</Label>
            <div className="flex flex-wrap gap-2">
              <div 
                className={`inline-flex items-center px-3 py-2 border rounded-md cursor-pointer transition-colors ${
                  isPlatformSelected('Twitter') 
                    ? 'border-blue-300 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handlePlatformToggle('Twitter')}
              >
                <Checkbox 
                  id="twitter" 
                  checked={isPlatformSelected('Twitter')} 
                  onCheckedChange={() => handlePlatformToggle('Twitter')}
                  className="mr-2"
                />
                Twitter
              </div>
              <div 
                className={`inline-flex items-center px-3 py-2 border rounded-md cursor-pointer transition-colors ${
                  isPlatformSelected('LinkedIn') 
                    ? 'border-blue-300 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handlePlatformToggle('LinkedIn')}
              >
                <Checkbox 
                  id="linkedin" 
                  checked={isPlatformSelected('LinkedIn')} 
                  onCheckedChange={() => handlePlatformToggle('LinkedIn')}
                  className="mr-2"
                />
                LinkedIn
              </div>
              <div 
                className={`inline-flex items-center px-3 py-2 border rounded-md cursor-pointer transition-colors ${
                  isPlatformSelected('Instagram') 
                    ? 'border-blue-300 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handlePlatformToggle('Instagram')}
              >
                <Checkbox 
                  id="instagram" 
                  checked={isPlatformSelected('Instagram')} 
                  onCheckedChange={() => handlePlatformToggle('Instagram')}
                  className="mr-2"
                />
                Instagram
              </div>
              <div 
                className={`inline-flex items-center px-3 py-2 border rounded-md cursor-pointer transition-colors ${
                  isPlatformSelected('Facebook') 
                    ? 'border-blue-300 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handlePlatformToggle('Facebook')}
              >
                <Checkbox 
                  id="facebook" 
                  checked={isPlatformSelected('Facebook')} 
                  onCheckedChange={() => handlePlatformToggle('Facebook')}
                  className="mr-2"
                />
                Facebook
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div>
            <Label htmlFor="post-content" className="block text-sm font-medium mb-1">Content</Label>
            <Textarea
              id="post-content"
              rows={4}
              placeholder="What would you like to share?"
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
            />
            <div className="mt-1 flex flex-col">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">{charCount}/280 characters</span>
                <button 
                  type="button" 
                  className="text-xs text-blue-600 hover:text-blue-700"
                  onClick={() => document.getElementById('ai-generation-section')?.classList.toggle('hidden')}
                >
                  AI Generation Options
                </button>
              </div>
              
              {/* AI Generation Section */}
              <div id="ai-generation-section" className="mt-3 p-3 border border-blue-100 rounded-md bg-blue-50 hidden">
                <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1 text-blue-600" />
                  Generate Content with AI
                </h4>
                <div className="flex items-start space-x-2">
                  <Input
                    type="text"
                    placeholder="Enter a topic or prompt (e.g., 'Announce our new feature launch')"
                    value={generationPrompt}
                    onChange={(e) => setGenerationPrompt(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleGenerateAI}
                    disabled={isGenerating || !generationPrompt.trim()}
                    className="whitespace-nowrap"
                  >
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </Button>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  AI will create content optimized for {selectedPlatforms[0] || 'Twitter'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="post-date" className="block text-sm font-medium mb-1">Schedule Date</Label>
              <Input
                type="date"
                id="post-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
              />
            </div>
            
            <div>
              <Label htmlFor="post-time" className="block text-sm font-medium mb-1">Schedule Time</Label>
              <Input
                type="time"
                id="post-time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>
          
          {/* Media Upload */}
          <div>
            <Label className="block text-sm font-medium mb-1">Media (optional)</Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-5 sm:mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={handleSaveDraft} disabled={createPostMutation.isPending}>
            Save as Draft
          </Button>
          <Button onClick={() => handleSubmit()} disabled={createPostMutation.isPending || selectedPlatforms.length === 0 || !content.trim()}>
            {createPostMutation.isPending ? 'Scheduling...' : 'Schedule Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPostDialog;
