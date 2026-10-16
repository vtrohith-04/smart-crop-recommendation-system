import json
import urllib.request
import urllib.error

USE_TESTCLIENT = False
base_url = "http://127.0.0.1:8000"

try:
    with urllib.request.urlopen(f"{base_url}/", timeout=1) as resp:
        if resp.getcode() == 200:
            print("Connected to live server at http://127.0.0.1:8000")
except Exception:
    USE_TESTCLIENT = True
    print("Live server not running at http://127.0.0.1:8000. Using FastAPI TestClient.")
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)

def run_get(endpoint):
    url = f"{base_url}{endpoint}" if not endpoint.startswith("http") else endpoint
    path = endpoint if endpoint.startswith("/") else "/" + endpoint.split(base_url)[-1].lstrip("/")
    print(f"\nGET {path}")
    if USE_TESTCLIENT:
        response = client.get(path)
        print(f"Status: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return response.status_code, response.json()
    else:
        try:
            with urllib.request.urlopen(url) as response:
                status = response.getcode()
                body = response.read().decode('utf-8')
                data = json.loads(body)
                print(f"Status: {status}")
                print(json.dumps(data, indent=2))
                return status, data
        except urllib.error.HTTPError as e:
            print(f"Error Status {e.code}: {e.read().decode('utf-8')}")
            return e.code, None
        except Exception as e:
            print(f"General Error: {e}")
            return None, None

def run_post(endpoint, payload):
    url = f"{base_url}{endpoint}" if not endpoint.startswith("http") else endpoint
    path = endpoint if endpoint.startswith("/") else "/" + endpoint.split(base_url)[-1].lstrip("/")
    print(f"\nPOST {path}")
    print(f"Payload: {json.dumps(payload)}")
    if USE_TESTCLIENT:
        response = client.post(path, json=payload)
        print(f"Status: {response.status_code}")
        try:
            data = response.json()
            print(json.dumps(data, indent=2))
            return response.status_code, data
        except Exception:
            print(response.text)
            return response.status_code, response.text
    else:
        data_bytes = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=data_bytes,
            headers={'Content-Type': 'application/json'}
        )
        try:
            with urllib.request.urlopen(req) as response:
                status = response.getcode()
                body = response.read().decode('utf-8')
                data = json.loads(body)
                print(f"Status: {status}")
                print(json.dumps(data, indent=2))
                return status, data
        except urllib.error.HTTPError as e:
            print(f"Error Status {e.code}: {e.read().decode('utf-8')}")
            return e.code, None
        except Exception as e:
            print(f"General Error: {e}")
            return None, None

print("====================================================")
print("RUNNING SYSTEM VALIDATION AND TEST CASES")
print("====================================================")

# 1. Health Checks
run_get("/")
run_get("/health")

# 2. Supported Crops
print("\n--- Supported Crops Endpoint ---")
status, crops_data = run_get("/supported-crops")
assert status == 200
assert crops_data["count"] == 51

# 3. Crop Recommendation - Valid Inputs
print("\n--- Crop Recommendation: Valid Inputs ---")
status, rec_data = run_post("/crop-recommendation", {
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": 25.0,
    "humidity": 80.0,
    "ph": 6.5,
    "rainfall": 200.0
})
assert status == 200
assert rec_data["recommended_crop"] == "rice"

# 4. Crop Recommendation - Invalid Inputs
print("\n--- Crop Recommendation: Invalid Inputs (Negative values and out of bounds) ---")
status, _ = run_post("/crop-recommendation", {
    "N": -10,
    "P": 42,
    "K": 43,
    "temperature": 20.8,
    "humidity": 82.0,
    "ph": -6.5,
    "rainfall": -202.9
})
assert status == 422

# 5. Yield Prediction - Supported Crop
print("\n--- Yield Prediction: Supported Crop (rice) ---")
status, y_res = run_post("/yield-prediction", {
    "crop": "rice",
    "state": "assam",
    "season": "whole year",
    "area": 1000.0,
    "annual_rainfall": 2000.0,
    "fertilizer": 150.0,
    "pesticide": 10.0
})
assert status == 200
assert y_res["yield_available"] is True
assert y_res["predicted_yield_tons_per_ha"] is not None

# 6. Yield Prediction - Canonical Mapped Crop (chickpea -> gram)
print("\n--- Yield Prediction: Canonical Mapped Crop (chickpea -> gram) ---")
status, m_res = run_post("/yield-prediction", {
    "crop": "chickpea",
    "state": "madhya pradesh",
    "season": "rabi",
    "area": 500.0,
    "annual_rainfall": 1000.0,
    "fertilizer": 80.0,
    "pesticide": 5.0
})
assert status == 200
assert m_res["yield_available"] is True
assert m_res["predicted_yield_tons_per_ha"] is not None

# 7. Yield Prediction - Unsupported Crop (apple)
print("\n--- Yield Prediction: Unsupported Crop (apple -> yield_available=false) ---")
status, u_res = run_post("/yield-prediction", {
    "crop": "apple",
    "state": "jammu and kashmir",
    "season": "whole year",
    "area": 50.0,
    "annual_rainfall": 800.0,
    "fertilizer": 40.0,
    "pesticide": 2.0
})
assert status == 200
assert u_res["yield_available"] is False
assert u_res["predicted_yield_tons_per_ha"] is None
assert u_res["yield_message"] == "No reliable yield data for this crop"

# 8. Yield Prediction - Inconsistent Units Crop (coconut -> yield_available=false)
print("\n--- Yield Prediction: Inconsistent Units Crop (coconut -> yield_available=false) ---")
status, c_res = run_post("/yield-prediction", {
    "crop": "coconut",
    "state": "kerala",
    "season": "whole year",
    "area": 100.0,
    "annual_rainfall": 2500.0,
    "fertilizer": 120.0,
    "pesticide": 8.0
})
assert status == 200
assert c_res["yield_available"] is False
assert c_res["predicted_yield_tons_per_ha"] is None

# 9. Yield Prediction - Invalid Inputs (Unrecognized crop & negative area)
print("\n--- Yield Prediction: Invalid Inputs (Unrecognized crop & negative area) ---")
status, _ = run_post("/yield-prediction", {
    "crop": "completely_unknown_crop_xyz",
    "state": "assam",
    "season": "whole year",
    "area": -100.0,
    "annual_rainfall": 2000.0,
    "fertilizer": 150.0,
    "pesticide": 10.0
})
assert status == 422

# 10. Smart Predict - Valid Inputs (Supported crop path)
print("\n--- Smart Predict (Combined): Supported Crop (rice) ---")
status, sp_res = run_post("/smart-predict", {
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
assert status == 200
assert sp_res["recommended_crop"] == "rice"
assert sp_res["yield_available"] is True

# 11. Smart Predict - Valid Inputs (Unsupported crop path e.g. apple)
print("\n--- Smart Predict (Combined): Unsupported Crop (apple) ---")
status, spa_res = run_post("/smart-predict", {
    "N": 20,
    "P": 130,
    "K": 200,
    "temperature": 22.0,
    "humidity": 92.0,
    "ph": 5.9,
    "rainfall": 110.0,
    "state": "assam",
    "season": "whole year",
    "area": 100.0,
    "fertilizer": 100.0,
    "pesticide": 10.0
})
assert status == 200
assert spa_res["recommended_crop"] == "apple"
assert spa_res["yield_available"] is False
assert spa_res["predicted_yield_tons_per_ha"] is None
assert spa_res["yield_message"] == "No reliable yield data for this crop"

# 12. Smart Predict - Invalid Inputs (Validation failure)
print("\n--- Smart Predict (Combined): Invalid Inputs ---")
status, _ = run_post("/smart-predict", {
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
assert status == 422

print("\nALL SYSTEM VALIDATION TESTS COMPLETED SUCCESSFULLY!")
