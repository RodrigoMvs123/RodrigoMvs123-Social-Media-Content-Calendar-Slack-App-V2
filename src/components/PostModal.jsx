import { useState } from 'react';
import axios from 'axios';
import { X, Wand2 } from 'lucide-react';
import { format } from 'date-fns';
import AIContentGenerator from './AIContentGenerator';

const PLATFORMS = ['twitter', 'linkedin', 'instagram', 'facebook'];

export default function PostModal({ post, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    content: post?.content || '',
    platform: post?.platform || PLATFORMS[0],
    scheduled_time: post?.scheduled_time
      ? format(new Date(post.scheduled_time), "yyyy-MM-dd'T'HH:mm")
      : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        scheduled_time: formData.scheduled_time || null,
      };

      if (post) {
        await axios.put(`/api/posts/${post.id}`, payload);
      } else {
        await axios.post('/api/posts', payload);
      }

      onSuccess();
    } catch (error) {
      setError(error.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleContentGenerated = (content, newSuggestions) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
    setSuggestions(newSuggestions);
    setShowAIGenerator(false);
  };

  const applySuggestion = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      content: suggestion
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {post ? 'Edit Post' : 'Create Post'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {showAIGenerator ? (
          <AIContentGenerator
            onContentGenerated={handleContentGenerated}
            initialPlatform={formData.platform}
          />
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Content</label>
                <button
                  type="button"
                  onClick={() => setShowAIGenerator(true)}
                  className="flex items-center space-x-1 text-sm text-primary hover:text-primary/90"
                >
                  <Wand2 className="h-4 w-4" />
                  <span>AI Generate</span>
                </button>
              </div>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="w-full rounded-md border bg-background px-3 py-2"
                rows={4}
                required
              />
            </div>

            {suggestions.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">AI Suggestions</label>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => applySuggestion(suggestion)}
                      className="cursor-pointer rounded-md border bg-background p-2 text-sm hover:bg-accent"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <select
                value={formData.platform}
                onChange={(e) =>
                  setFormData({ ...formData, platform: e.target.value })
                }
                className="w-full rounded-md border bg-background px-3 py-2"
                required
              >
                {PLATFORMS.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Schedule Time</label>
              <input
                type="datetime-local"
                value={formData.scheduled_time}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_time: e.target.value })
                }
                className="w-full rounded-md border bg-background px-3 py-2"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Saving...' : post ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 