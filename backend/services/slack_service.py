from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
import os
from datetime import datetime

class SlackService:
    def __init__(self):
        self.client = WebClient(token=os.getenv("SLACK_BOT_TOKEN"))
        self.channel = os.getenv("SLACK_CHANNEL_ID")

    async def send_post_notification(self, post, action="created"):
        try:
            scheduled_time = post.scheduled_time.strftime("%Y-%m-%d %H:%M:%S") if post.scheduled_time else "Not scheduled"
            
            blocks = [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": f"Post {action.capitalize()}"
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": f"*Platform:*\n{post.platform.value}"
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*Status:*\n{post.status.value}"
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*Scheduled Time:*\n{scheduled_time}"
                        }
                    ]
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Content:*\n{post.content}"
                    }
                }
            ]

            await self.client.chat_postMessage(
                channel=self.channel,
                blocks=blocks
            )
        except SlackApiError as e:
            print(f"Error sending Slack notification: {str(e)}")

    async def send_error_notification(self, error_message: str, post_id: int = None):
        try:
            blocks = [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "❌ Post Error"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Error:*\n{error_message}"
                    }
                }
            ]

            if post_id:
                blocks.append({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Post ID:*\n{post_id}"
                    }
                })

            await self.client.chat_postMessage(
                channel=self.channel,
                blocks=blocks
            )
        except SlackApiError as e:
            print(f"Error sending Slack notification: {str(e)}")

slack_service = SlackService() 