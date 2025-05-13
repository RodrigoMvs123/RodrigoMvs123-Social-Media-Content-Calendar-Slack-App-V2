# Social Media Content Calendar

A modern social media content management application with AI-powered content generation and Slack integration.

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.13)
- **Database**: SQLite (via SQLAlchemy)
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: OpenAI GPT-3.5
- **Notifications**: Slack API

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: Zustand
- **UI Components**: 
  - Radix UI
  - Tailwind CSS
  - Shadcn UI
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Date Handling**: date-fns
- **Notifications**: react-hot-toast

## Prerequisites

- Python 3.13 or higher
- Node.js 18 or higher
- npm or yarn
- OpenAI API key
- Slack Bot Token and Channel ID

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd social-media-content-calendar
```

2. Set up the Python virtual environment:
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Unix/macOS
python3 -m venv venv
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Install Node.js dependencies:
```bash
npm install
```

5. Create a `.env` file in the root directory:
```env
DATABASE_URL=sqlite:///./app.db
OPENAI_API_KEY=your_openai_api_key
SLACK_BOT_TOKEN=your_slack_bot_token
SLACK_CHANNEL_ID=your_slack_channel_id
JWT_SECRET=your_jwt_secret_key
CORS_ORIGINS=http://localhost:3000
```

## Running the Application

1. Start the backend server:
```bash
# Make sure you're in the virtual environment
uvicorn backend.main:app --reload
```
The backend will be available at http://localhost:8000

2. In a new terminal, start the frontend development server:
```bash
npm run dev
```
The frontend will be available at http://localhost:3000

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Features

- **Content Management**
  - Create, read, update, and delete social media posts
  - Schedule posts for different platforms
  - Media attachment support
  
- **AI Integration**
  - AI-powered content generation
  - Platform-specific content suggestions
  - Multiple tone options
  
- **Analytics**
  - Post performance tracking
  - Engagement metrics
  - Platform-specific analytics
  
- **Collaboration**
  - Multi-user support
  - Role-based access control
  - Slack notifications for post updates

## Troubleshooting

### Common Issues

1. **Backend startup errors**:
   - Ensure Python virtual environment is activated
   - Verify all environment variables are set correctly
   - Check if the required ports are available

2. **Frontend connection issues**:
   - Verify the backend is running
   - Check CORS configuration
   - Ensure API endpoints are correctly configured

3. **Database issues**:
   - Check if SQLite database file exists
   - Verify write permissions in the project directory

### Version Compatibility

- FastAPI: 0.104.1
- Pydantic: 1.10.13
- SQLAlchemy: 2.0.23
- React: 18.2.0
- Vite: 5.0.0

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.