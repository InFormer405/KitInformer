from openai import OpenAI
import os

# Initialize the client using the API key stored in Replit secrets
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Test message
prompt = "Say 'Connection successful! The OpenAI API is working.'"

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": prompt}
    ]
)

print(response.choices[0].message.content)