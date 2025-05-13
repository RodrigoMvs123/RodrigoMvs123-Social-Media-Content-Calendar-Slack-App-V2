import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, type Post, type InsertPost } from "../shared/schema";
import { notifyNewPost } from "./slack";
import { generateContent, generateContentIdeas, analyzeSentiment, optimizePost } from "./openai";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Render deployment
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Initialize database with sample data if empty
  async function initializeDatabase() {
    try {
      // Check if there are any posts
      const existingPosts = await storage.getPosts();
      
      // If no posts exist, add sample data
      if (existingPosts.length === 0) {
        const samplePosts: InsertPost[] = [
          {
            platform: "Twitter",
            content: "Check out our latest product update!",
            scheduledTime: new Date(Date.now() + 86400000), // Tomorrow
            status: "ready"
          },
          {
            platform: "LinkedIn",
            content: "We are hiring! Join our amazing team.",
            scheduledTime: new Date(Date.now() + 172800000), // Day after tomorrow
            status: "needs_approval"
          },
          {
            platform: "Instagram",
            content: "Behind the scenes at our company retreat! Our team building activities helped foster creativity and collaboration.",
            scheduledTime: new Date(Date.now() + 259200000), // 3 days from now
            status: "scheduled"
          },
          {
            platform: "Facebook",
            content: "Customer Spotlight: How ABC Corp increased productivity by 200% using our platform. Read their success story!",
            scheduledTime: new Date(Date.now() + 604800000), // 1 week from now
            status: "draft"
          }
        ];

        // Insert sample posts
        for (const post of samplePosts) {
          await storage.createPost(post);
        }
        
        console.log("Database initialized with sample data");
      }
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }
  
  // Initialize database
  initializeDatabase();

  // Get all calendar posts
  app.get("/api/calendar", async (req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Create a new post
  app.post("/api/calendar/posts", async (req, res) => {
    try {
      // Validate request body using Zod schema
      const validationResult = insertPostSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid post data", 
          details: validationResult.error.format() 
        });
      }
      
      const newPost = validationResult.data;
      
      // Save to database
      const post = await storage.createPost(newPost);
      
      // Send notification to Slack if status is scheduled or ready
      if (post.status === 'scheduled' || post.status === 'ready') {
        try {
          await notifyNewPost(post);
        } catch (slackError) {
          console.error("Failed to send Slack notification:", slackError);
          // Continue with the response even if Slack notification fails
        }
      }
      
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  // Generate AI content with OpenAI
  app.post("/api/calendar/generate", async (req, res) => {
    try {
      const { prompt, platform = 'general' } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ 
          error: "OpenAI API key is not configured. Please add the OPENAI_API_KEY environment variable.",
          code: "api_key_missing"
        });
      }
      
      // Generate content using OpenAI
      const aiContent = await generateContent(prompt, platform);
      
      res.json({ content: aiContent });
    } catch (error) {
      console.error("Error generating content:", error);
      
      // Check if it's a rate limit or quota error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('rate') || 
          errorMessage.includes('quota') ||
          errorMessage.includes('exceeded')) {
        return res.status(429).json({ 
          error: "OpenAI API rate limit or quota exceeded. Please check your OpenAI account.",
          code: "rate_limit_exceeded"
        });
      }
      
      res.status(500).json({ 
        error: "Failed to generate content. Please try again later.",
        code: "generation_failed"
      });
    }
  });
  
  // Generate content ideas
  app.post("/api/calendar/ideas", async (req, res) => {
    try {
      const { topic, count = 5 } = req.body;
      
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }
      
      // Generate ideas using OpenAI
      const ideas = await generateContentIdeas(topic, count);
      
      res.json({ ideas });
    } catch (error) {
      console.error("Error generating ideas:", error);
      res.status(500).json({ error: "Failed to generate content ideas" });
    }
  });
  
  // Analyze post sentiment
  app.post("/api/calendar/analyze", async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }
      
      // Analyze sentiment using OpenAI
      const analysis = await analyzeSentiment(content);
      
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing content:", error);
      res.status(500).json({ error: "Failed to analyze content" });
    }
  });
  
  // Optimize post content
  app.post("/api/calendar/optimize", async (req, res) => {
    try {
      const { content, platform } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }
      
      // Optimize the post using OpenAI
      const optimized = await optimizePost({ content, platform });
      
      res.json({ content: optimized });
    } catch (error) {
      console.error("Error optimizing content:", error);
      res.status(500).json({ error: "Failed to optimize content" });
    }
  });

  // Delete a post
  app.delete("/api/calendar/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }
      
      // Delete from database
      const success = await storage.deletePost(id);
      
      if (!success) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Update a post
  app.patch("/api/calendar/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }
      
      // Check if post exists
      const existingPost = await storage.getPostById(id);
      
      if (!existingPost) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      // Validate update data
      const updates = req.body;
      
      // Update post in database
      const updatedPost = await storage.updatePost(id, updates);
      
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ error: "Failed to update post" });
    }
  });

  // Slack integration status endpoint
  app.get("/api/slack/status", async (req, res) => {
    try {
      const hasToken = !!process.env.SLACK_BOT_TOKEN;
      const hasChannel = !!process.env.SLACK_CHANNEL_ID;
      
      res.json({
        connected: hasToken && hasChannel,
        channelConfigured: hasChannel,
        tokenConfigured: hasToken,
        // Don't expose the actual token in the response
      });
    } catch (error) {
      console.error("Error checking Slack status:", error);
      res.status(500).json({ error: "Failed to check Slack status" });
    }
  });

  // Slack webhook endpoint (for Events API, including app_home_opened)
  app.post("/api/slack/webhook", (req, res) => {
    try {
      // Process the incoming webhook
      const body = req.body;
      console.log("Received Slack webhook:", body);
      
      // Handle URL verification challenge from Slack
      if (body && body.type === 'url_verification') {
        console.log("Handling Slack URL verification challenge");
        return res.status(200).json({ challenge: body.challenge });
      }
      
      // Handle app_home_opened event
      if (body && body.event && body.event.type === 'app_home_opened') {
        console.log(`User ${body.event.user} opened the app home`);
        // Here you would update the app home view for the user
        // This would typically involve making a call to Slack's views.publish method
      }
      
      // Extract text from the webhook if it exists (for message events)
      if (body && body.event && body.event.type === 'message') {
        const text = body.event.text || "No message content";
        const user = body.event.user || "Unknown user";
        console.log(`Message received from ${user}: ${text}`);
      }
      
      // Return a 200 response quickly as required by Slack
      res.status(200).send();
    } catch (error) {
      console.error("Error processing Slack webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });
  
  // Webhook URL for use with curl (as shown in your Slack dashboard)
  app.post("/api/slack/incoming-webhook", (req, res) => {
    try {
      const message = req.body;
      
      if (!message || !message.text) {
        return res.status(400).json({ error: "Message text is required" });
      }
      
      console.log("Received incoming webhook message:", message);
      
      // Process the message and use it in the app
      // For example, you could create a new post based on the message
      
      res.status(200).json({ message: "Webhook received successfully" });
    } catch (error) {
      console.error("Error processing incoming webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
