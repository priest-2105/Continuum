import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

db = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])

records = [
    {
        "id": "etsy-test-001",
        "company": "etsy",
        "title": "Database Connection Pool Exhaustion During Peak Traffic",
        "url": "https://www.etsy.com/codeascraft/the-outage-that-taught-us-about-connection-pools",
        "published_at": "2023-11-15T10:00:00Z",
        "severity": "critical",
        "affected_services": ["checkout", "search", "listings"],
        "root_cause_category": "Resource Exhaustion",
        "ai_summary": "On November 15, 2023, Etsy experienced a 47-minute outage affecting checkout, search, and listing services. The root cause was connection pool exhaustion triggered by an unexpected 3x traffic spike during a flash sale. Action items include implementing adaptive connection pooling, adding circuit breakers, and pre-scaling infrastructure before major sale events.",
        "tags": ["database", "connection-pool", "outage", "performance"],
        "status": "pending",
    },
    {
        "id": "etsy-test-002",
        "company": "etsy",
        "tso this is what itle": "Search Index Corruption Following Deployment",
        "url": "https://www.etsy.com/codeascraft/search-index-incident-2023",
        "published_at": "2023-08-22T14:30:00Z",
        "severity": "high",
        "affected_services": ["search", "recommendations"],
        "root_cause_category": "Deployment Error",
        "ai_summary": "A routine search service deployment on August 22 introduced a schema migration bug that corrupted the primary search index. Search results degraded for 2.5 hours affecting 40% of buyer sessions. The incident was mitigated by rolling back the deployment and rebuilding the index from a clean snapshot. Follow-up actions include adding index integrity checks to CI and requiring dual-approval for schema migrations.",
        "tags": ["search", "deployment", "index", "rollback"],
        "status": "pending",
    },
]

for r in records:
    # upsert to avoid duplicate errors on re-runs
    result = db.table("postmortems").upsert(r).execute()
    print(f"Upserted: {result.data[0]['id']} [{result.data[0]['status']}]")

print("\nDone. Check /admin/queue to review.")
