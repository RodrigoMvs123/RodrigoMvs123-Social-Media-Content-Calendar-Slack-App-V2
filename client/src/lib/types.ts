export interface Post {
  id?: string;
  platform: string;
  content: string;
  scheduledTime: string;
  status?: 'draft' | 'scheduled' | 'published' | 'needs_approval' | 'ready';
}

export interface PostsGroupedByDate {
  date: string;
  title: string;
  posts: Post[];
}

export interface FilterOptions {
  platform: string;
  dateRange: string;
  status: string;
  searchQuery: string;
}
