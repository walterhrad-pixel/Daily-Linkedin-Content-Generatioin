from google.cloud import firestore
import os

_db = None

def get_db() -> firestore.Client:
    global _db
    if _db is None:
        project_id = os.environ.get("FIREBASE_PROJECT_ID")
        # Initialize Firestore client. Relies on GOOGLE_APPLICATION_CREDENTIALS.
        _db = firestore.Client(project=project_id)
    return _db

def fetch_kb() -> str:
    """Fetch all knowledge base documents and combine them."""
    db = get_db()
    docs = db.collection("kb").stream()
    kb_contents = []
    for doc in docs:
        data = doc.to_dict()
        if data and "content" in data:
            kb_contents.append(f"--- Knowledge Base: {doc.id} ---\n{data['content']}")
    
    if not kb_contents:
        return ""
    
    return "\n\n" + "\n\n".join(kb_contents) + "\n\n"

def save_daily_post(product_name: str, audience: str, format_type: str | None, content: str) -> None:
    """Save the final generated post into Firestore."""
    db = get_db()
    doc_ref = db.collection("daily_posts").document()
    doc_ref.set({
        "product_name": product_name,
        "audience": audience,
        "format": format_type,
        "content": content,
        "created_at": firestore.SERVER_TIMESTAMP,
    })
