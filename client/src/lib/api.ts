import { Post } from "./types";

const API_BASE_URL = window.location.origin;

export async function fetchCalendarPosts(): Promise<Post[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/calendar`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    throw error;
  }
}

export async function createPost(post: Omit<Post, 'id'>): Promise<Post> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/calendar/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

export async function generateAIContent(prompt: string, platform?: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/calendar/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, platform }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Error generating AI content:", error);
    throw error;
  }
}

export async function generateContentIdeas(topic: string, count: number = 5): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/calendar/ideas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, count }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.ideas || [];
  } catch (error) {
    console.error("Error generating content ideas:", error);
    throw error;
  }
}

export async function analyzePostSentiment(content: string): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  feedback?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/calendar/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error analyzing post sentiment:", error);
    throw error;
  }
}

export async function optimizePostContent(content: string, platform?: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/calendar/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, platform }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Error optimizing post content:", error);
    throw error;
  }
}
