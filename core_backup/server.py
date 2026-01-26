from fastapi import FastAPI
from supabase import create_client, Client
import os

# Initialize FastAPI app
app = FastAPI()
@app.get("/api/test")
def test():
    return {"status": "Backend connected successfully!"}
# Connect to Supabase using environment secrets
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Test Routes ---

@app.get("/")
def read_root():
    return {"message": "Informer backend connected successfully"}

@app.get("/kits")
def get_kits():
    """Example route to fetch data from your 'kits' table"""
    response = supabase.table("kits").select("*").execute()
    return response.data