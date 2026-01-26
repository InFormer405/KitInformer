from supabase import create_client, Client
import os

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(url, key)

data = {
    "name": "Demo Kit",
    "description": "Testing Supabase connection after enabling RLS policy.",
    "price": 29.99,
    "drive_link": "https://drive.google.com/example"
}

response = supabase.table("kits").insert(data).execute()

print("✅ Insert complete!")
print("Response:", response)
