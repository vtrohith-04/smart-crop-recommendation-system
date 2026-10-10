import urllib.request
import json
import sys

def test_get(url):
    print(f"\n=== GET {url} ===")
    try:
        with urllib.request.urlopen(url) as response:
            status = response.getcode()
            body = response.read().decode('utf-8')
            print(f"Status: {status}")
            print(json.dumps(json.loads(body), indent=2))
    except Exception as e:
        print(f"Error: {e}")

def test_post(url, payload):
    print(f"\n=== POST {url} ===")
    print(f"Payload: {json.dumps(payload)}")
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req) as response:
            status = response.getcode()
            body = response.read().decode('utf-8')
            print(f"Status: {status}")
            print(json.dumps(json.loads(body), indent=2))
    except Exception as e:
        if hasattr(e, 'read'):
            err_body = e.read().decode('utf-8')
            print(f"Error {e.code}: {err_body}")
        else:
            print(f"Error: {e}")

base_url = "http://127.0.0.1:8000"

# 1. Health check
test_get(f"{base_url}/")

# 2. Crop Recommendation
recommendation_payload = {
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": 20.8,
    "humidity": 82.0,
    "ph": 6.5,
    "rainfall": 202.9
}
test_post(f"{base_url}/crop-recommendation", recommendation_payload)

# 3. Yield Prediction
yield_payload = {
    "crop": "rice",
    "state": "assam",
    "season": "whole year",
    "area": 1000.0,
    "annual_rainfall": 2000.0,
    "fertilizer": 150.0,
    "pesticide": 10.0
}
test_post(f"{base_url}/yield-prediction", yield_payload)

# 4. Combined Prediction
combined_payload = {
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": 20.8,
    "humidity": 82.0,
    "ph": 6.5,
    "rainfall": 202.9,
    "state": "assam",
    "season": "whole year",
    "area": 1000.0,
    "fertilizer": 150.0,
    "pesticide": 10.0
}
test_post(f"{base_url}/predict", combined_payload)
