import requests
import io
import time

csv_data = """Student Reference,Examination ID,Institution Name,Credential Type,Grade,Issue Date
BULK-STU-001,EXAM-2026,Demo University,Degree Certificate,A,2026-09-17
BULK-STU-002,EXAM-2026,Demo University,Degree Certificate,B,2026-09-17
BULK-STU-001,EXAM-2026,Demo University,Degree Certificate,A,2026-09-17
"""

print("Sending CSV to /api/v1/credentials/bulk-issue...")
res = requests.post(
    "http://127.0.0.1:8000/api/v1/credentials/bulk-issue", 
    files={"file": ("test.csv", csv_data, "text/csv")}
)

print("Status Code:", res.status_code)
try:
    print("Response:", res.json())
except Exception as e:
    print("Error parsing JSON:", res.text)
