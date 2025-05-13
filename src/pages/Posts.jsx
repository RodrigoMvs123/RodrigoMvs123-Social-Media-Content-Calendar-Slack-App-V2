import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash } from 'lucide-react';
import { format } from 'date-fns';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    setSelectedPost(null);
    setIsCreateModalOpen(true);
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setIsCreateModalOpen(true);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`/api/posts/${postId}`);
        setPosts(posts.filter(post => post.id !== postId));
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Posts</h1>
        <button
          onClick={handleCreatePost}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Post
        </button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium">Content</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Platform</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Scheduled</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b">
                  <td className="px-4 py-3 text-sm">
                    {post.content.length > 50
                      ? `${post.content.substring(0, 50)}...`
                      : post.content}
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">{post.platform}</td>
                  <td className="px-4 py-3 text-sm capitalize">{post.status}</td>
                  <td className="px-4 py-3 text-sm">
                    {post.scheduled_time
                      ? format(new Date(post.scheduled_time), 'MMM d, yyyy h:mm a')
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="rounded-md p-2 hover:bg-accent"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="rounded-md p-2 hover:bg-accent"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-muted-foreground">
                    No posts found. Create your first post!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCreateModalOpen && (
        <PostModal
          post={selectedPost}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchPosts();
          }}
        />
      )}
    </div>
  );
} 