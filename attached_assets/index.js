const { App, ExpressReceiver } = require('@slack/bolt');
require('dotenv').config();
const axios = require('axios');
const path = require('path');
const express = require('express');

// Create the receiver with the signing secret
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  processBeforeResponse: true
});

// Set up the Express app from the receiver
const expressApp = receiver.app;

// Serve static files from public directory
expressApp.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get calendar data
expressApp.get('/api/calendar', async (req, res) => {
  try {
    // If you have a real database, replace this with actual DB query
    // This is mock data for now
    const posts = [
      {
        platform: 'Twitter',
        content: 'Check out our latest product update!',
        scheduledTime: new Date(Date.now() + 86400000).toISOString() // Tomorrow
      },
      {
        platform: 'LinkedIn',
        content: 'We are hiring! Join our amazing team.',
        scheduledTime: new Date(Date.now() + 172800000).toISOString() // Day after tomorrow
      }
    ];
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    res.status(500).json({ error: 'Failed to fetch calendar data' });
  }
});

// HTML route for the web interface
expressApp.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create the Slack app with the receiver
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver
});

// Listen for App Home opened event
app.event('app_home_opened', async ({ event, client }) => {
  try {
    const userId = event.user;

    // Determine API URL based on environment
    const apiBaseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.RENDER_EXTERNAL_URL 
      : 'http://localhost:3000';
    
    // Fetch data from our own API endpoint
    const response = await axios.get(`${apiBaseUrl}/api/calendar`);
    const posts = response.data;

    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `👋 Welcome <@${userId}>! Here's your Social Media Content Calendar:`
        }
      },
      {
        type: 'divider'
      },
      ...posts.map(post => ({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${post.platform}*: ${post.content}\n_Scheduled for: ${new Date(post.scheduledTime).toLocaleString()}_`
        }
      })),
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Add New Post'
            },
            action_id: 'add_new_post'
          }
        ]
      }
    ];

    // Publish view to Home tab
    await client.views.publish({
      user_id: userId,
      view: {
        type: 'home',
        callback_id: 'home_view',
        blocks
      }
    });
  } catch (error) {
    console.error('Error rendering app_home_opened:', error);
  }
});

// Add interaction for Add New Post button
app.action('add_new_post', async ({ body, ack, client }) => {
  await ack();

  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: 'modal',
      callback_id: 'new_post_modal',
      title: {
        type: 'plain_text',
        text: 'Add New Post'
      },
      submit: {
        type: 'plain_text',
        text: 'Submit'
      },
      close: {
        type: 'plain_text',
        text: 'Cancel'
      },
      blocks: [
        {
          type: 'input',
          block_id: 'content_block',
          label: {
            type: 'plain_text',
            text: 'Post Content'
          },
          element: {
            type: 'plain_text_input',
            action_id: 'content_input'
          }
        },
        {
          type: 'input',
          block_id: 'platform_block',
          label: {
            type: 'plain_text',
            text: 'Platform'
          },
          element: {
            type: 'static_select',
            action_id: 'platform_select',
            options: [
              {
                text: {
                  type: 'plain_text',
                  text: 'Twitter'
                },
                value: 'Twitter'
              },
              {
                text: {
                  type: 'plain_text',
                  text: 'LinkedIn'
                },
                value: 'LinkedIn'
              }
            ]
          }
        }
      ]
    }
  });
});

// Handle modal submission
app.view('new_post_modal', async ({ ack, body, view, client }) => {
  await ack();
  
  const user = body.user.id;
  const content = view.state.values.content_block.content_input.value;
  const platform = view.state.values.platform_block.platform_select.selected_option.value;

  // Save to database (mock for now)
  const newPost = {
    platform,
    content,
    scheduledTime: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
  };

  // In a real app, you'd save this to a database
  // await db.posts.insert(newPost);

  // Notify user
  await client.chat_postMessage({
    channel: user,
    text: `✅ New post scheduled on *${platform}*: ${content}`
  });

  // Refresh the home tab to show the new post
  const userId = body.user.id;
  app.client.views.publish({
    user_id: userId,
    view: {
      type: 'home',
      callback_id: 'home_view',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Refreshing your calendar...'
          }
        }
      ]
    }
  });

  // Trigger app_home_opened manually to refresh
  app.client.apiCall('apps.event.authorizations.list', {
    event_context: JSON.stringify({
      user_id: userId,
      channel_id: userId,
      is_enterprise_install: false
    }),
    event: {
      type: 'app_home_opened',
      user: userId
    }
  });
});

// Start the app
(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  console.log(`⚡️ Social Media Calendar app is running on port ${port}!`);
})();

module.exports = receiver.app; 