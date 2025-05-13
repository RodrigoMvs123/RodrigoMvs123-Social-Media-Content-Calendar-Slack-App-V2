import { useState } from 'react';
import { format } from 'date-fns';
import { Post } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Bookmark, 
  TrendingUp, 
  Send, 
  Edit, 
  Trash2 
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PostItemProps {
  post: Post;
  viewType: 'grid' | 'list';
}

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'twitter':
      return <MessageSquare className="h-6 w-6" />;
    case 'linkedin':
      return <Bookmark className="h-6 w-6" />;
    case 'instagram':
      return <Send className="h-6 w-6" />;
    case 'facebook':
      return <TrendingUp className="h-6 w-6" />;
    default:
      return <MessageSquare className="h-6 w-6" />;
  }
};

const getPlatformColor = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'twitter':
      return 'bg-blue-100 text-blue-700';
    case 'linkedin':
      return 'bg-indigo-100 text-indigo-800';
    case 'instagram':
      return 'bg-pink-100 text-pink-800';
    case 'facebook':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-purple-100 text-purple-800';
  }
};

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'draft':
      return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">Draft</Badge>;
    case 'scheduled':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">Scheduled</Badge>;
    case 'published':
      return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">Published</Badge>;
    case 'needs_approval':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Needs approval</Badge>;
    case 'ready':
      return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">Ready to publish</Badge>;
    default:
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">Scheduled</Badge>;
  }
};

const PostItem = ({ post, viewType }: PostItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const platformIconClass = getPlatformColor(post.platform);
  const formattedTime = format(new Date(post.scheduledTime), 'h:mm a');
  
  return (
    <div 
      className="p-6 hover:bg-gray-50 transition-colors duration-150"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 ${platformIconClass} rounded-lg flex items-center justify-center shadow-sm`}>
            {getPlatformIcon(post.platform)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className={`bg-${post.platform.toLowerCase()}-100 hover:bg-${post.platform.toLowerCase()}-200`}>
                {post.platform}
              </Badge>
              <span className="ml-2 text-sm text-gray-500">{formattedTime}</span>
            </div>
            <div className="flex">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-gray-400 hover:text-gray-500 mr-2">
                      <Edit className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit post</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-gray-400 hover:text-gray-500">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete post</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-900">{post.content}</p>
          <div className="mt-2">
            {getStatusBadge(post.status)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostItem;
