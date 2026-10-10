import urllib.request
import urllib.error
import json

base_url = "http://127.0.0.1:8000"

def run_get(endpoint):
    url = f"{base_url}{endpoint}"
    print(f"\nGET {endpoint}")
    try:
        with urllib.request.urlopen(url) as response:
            status = response.getcode()
            body = response.read().decode('utf-8')
            print(f"Status: {status}")
            print(json.dumps(json.loads(body), indent=2))
    except urllib.error.HTTPError as e:
        print(f"Error Status {e.code}: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"General Error: {e}")

def run_post(endpoint, payload):
    url = f"{base_url}{endpoint}"
    print(f"\nPOST {endpoint}")
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
    except urllib.error.HTTPError as e:
        print(f"Error Status {e.code}: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"General Error: {e}")

print("====================================================")
print("RUNNING SYSTEM VALIDATION AND TEST CASES")
print("====================================================")

# 1. Health Checks
run_get("/")
run_get("/health")

# 2. Crop Recommendation - Valid Inputs
print("\n--- Crop Recommendation: Valid Inputs ---")
run_post("/crop-recommendation", {
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": 25.0,
    "humidity": 80.0,
    "ph": 6.5,
    "rainfall": 200.0
})

# 3. Crop Recommendation - Invalid Inputs
print("\n--- Crop Recommendation: Invalid Inputs (Negative values and out of bounds) ---")
run_post("/crop-recommendation", {
    "N": -10,
    "P": 42,
    "K": 43,
    "temperature": 20.8,
    "humidity": 82.0,
    "ph": -6.5,
    "rainfall": -202.9
})

# 4. Yield Prediction - Valid Inputs
print("\n--- Yield Prediction: Valid Inputs ---")
run_post("/yield-prediction", {
    "crop": "rice",
    "state": "assam",
    "season": "whole year",
    "area": 1000.0,
    "annual_rainfall": 2000.0,
    "fertilizer": 150.0,
    "pesticide": 10.0
})

# 5. Yield Prediction - Invalid Inputs
print("\n--- Yield Prediction: Invalid Inputs (Unsupported Crop, State, Season, Area) ---")
run_post("/yield-prediction", {
    "crop": "invalid_crop",
    "state": "assam",
    "season": "whole year",
    "area": -100.0,
    "annual_rainfall": 2000.0,
    "fertilizer": 150.0,
    "pesticide": 10.0
})

# 6. Smart Predict - Valid Inputs
print("\n--- Smart Predict (Combined): Valid Inputs ---")
run_post("/smart-predict", {
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
})

# 7. Smart Predict - Invalid Inputs
print("\n--- Smart Predict (Combined): Invalid Inputs ---")
run_post("/smart-predict", {
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": -20.8, # negative temp out of bounds
    "humidity": 120.0,    # hum > 100
    "ph": 6.5,
    "rainfall": 202.9,
    "state": "invalid_state",
    "season": "whole year",
    "area": 1000.0,
    "fertilizer": 150.0,
    "pesticide": 10.0
})
