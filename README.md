# Social Media Content Calendar

A modern social media content management application with Slack integration and AI-powered content generation.

## Features

- **Content Calendar**: Schedule and manage social media posts across multiple platforms
- **AI Content Generation**: Create engaging content using OpenAI's GPT models
- **Slack Integration**: Receive notifications and updates in your Slack workspace
- **Content Analytics**: View reports and insights on your social media content
- **Multi-platform Support**: Supports Twitter, LinkedIn, Instagram, and Facebook

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI API
- **Messaging**: Slack API

## Deployment

This application is configured for deployment on Render using the included `render.yaml` file.

### Required Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: API key for OpenAI
- `SLACK_BOT_TOKEN`: Bot token for Slack API
- `SLACK_CHANNEL_ID`: Slack channel ID for notifications

## Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables
4. Start the development server with `npm run dev`

## License

MIT