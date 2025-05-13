from flask import Flask, request, jsonify
from slack_sdk import WebClient
from slack_sdk.signature import SignatureVerifier
import os
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

app = Flask(__name__)

client = WebClient(token=os.environ.get("SLACK_BOT_TOKEN"))
signature_verifier = SignatureVerifier(os.environ.get("SLACK_SIGNING_SECRET"))

@app.route("/slack/events", methods=["POST"])
def slack_events():
    if not signature_verifier.is_valid_request(request.get_data(), request.headers):
        return jsonify({"error": "Invalid request"}), 403
    
    data = request.json
    print("Received Slack event:", data)
    
    # Handle app_mention
    if data.get("type") == "event_callback" and data.get("event", {}).get("type") == "app_mention":
        event = data.get("event", {})
        user_id = event.get("user")
        channel = event.get("channel")

        client.chat_postMessage(
            channel=channel,
            text=f"Hello <@{user_id}>! I'm your Social Media Content Calendar bot.",
            blocks=[
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"Hello <@{user_id}>! I'm your Social Media Content Calendar bot."
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "I can help you manage your social media calendar. What would you like to do today?"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "• View upcoming posts\n• Add new content ideas\n• Check posting schedule\n• Generate content suggestions"
                    }
                }
            ]
        )
    
    # Handle app_home_opened
    elif data.get("type") == "event_callback" and data.get("event", {}).get("type") == "app_home_opened":
        user_id = data["event"]["user"]

        client.views_publish(
            user_id=user_id,
            view={
                "type": "home",
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": f"👋 Hello <@{user_id}>! Welcome to your Social Media Content Calendar!"
                        }
                    },
                    { "type": "divider" },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "Here's what I can help you with:"
                        }
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "• View upcoming posts\n• Add new content ideas\n• Check posting schedule\n• Generate content suggestions"
                        }
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "mrkdwn",
                                "text": "🚀 Let’s boost your content game!"
                            }
                        ]
                    }
                ]
            }
        )

    # Slack verification challenge
    elif data.get("type") == "url_verification":
        return jsonify({"challenge": data.get("challenge")})
        
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
