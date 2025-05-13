import requests

# Replace this with your actual webhook URL from Slack
webhook_url = "https://hooks.slack.com/services/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"  # <-- REPLACE THIS!

# Data to send
data = {
    "text": "Gotta get the bread and milk!"
}

# Send the POST request
response = requests.post(
    webhook_url,
    json=data,
    headers={"Content-Type": "application/json"}
)

# Print the results
print(f"Status code: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 200:
    print("Success! Check your Slack channel for the message.")
else:
    print(f"Error: {response.text}")