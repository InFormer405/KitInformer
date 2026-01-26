from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import os

SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly']

def main():
    print("Starting Google Drive connection test...")
    
    flow = InstalledAppFlow.from_client_config(
        {
            "web": {
                "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                "redirect_uris": ["https://replit.com/auth/google"],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token"
            }
        },
        SCOPES
    )

    creds = flow.run_local_server(port=0)
    service = build('drive', 'v3', credentials=creds)

    results = service.files().list(pageSize=5, fields="files(id, name)").execute()
    items = results.get('files', [])

    if not items:
        print('No files found.')
    else:
        print('First 5 files in your Drive:')
        for item in items:
            print(f"{item['name']} ({item['id']})")

if __name__ == '__main__':
    main()