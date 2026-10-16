import json
import sys
import urllib.request
import urllib.error

# Determine whether live server is running on port 8000, otherwise fallback to FastAPI TestClient
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

def test_get(endpoint):
    url = f"{base_url}{endpoint}" if not endpoint.startswith("http") else endpoint
    path = endpoint if endpoint.startswith("/") else "/" + endpoint.split(base_url)[-1].lstrip("/")
    print(f"\n=== GET {path} ===")
    
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
            err_body = e.read().decode('utf-8')
            print(f"Error {e.code}: {err_body}")
            return e.code, None
        except Exception as e:
            print(f"Error: {e}")
            return None, None

def test_post(endpoint, payload):
    url = f"{base_url}{endpoint}" if not endpoint.startswith("http") else endpoint
    path = endpoint if endpoint.startswith("/") else "/" + endpoint.split(base_url)[-1].lstrip("/")
    print(f"\n=== POST {path} ===")
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
            err_body = e.read().decode('utf-8')
            print(f"Error {e.code}: {err_body}")
            return e.code, None
        except Exception as e:
            print(f"Error: {e}")
            return None, None


print("====================================================")
print("RUNNING ENDPOINT VERIFICATION TESTS")
print("====================================================")

# 1. Health check
status, _ = test_get("/")
assert status == 200, f"Expected 200, got {status}"

# 2. Supported Crops
status, data = test_get("/supported-crops")
assert status == 200, f"Expected 200, got {status}"
assert data["count"] == 51, f"Expected 51 supported crops, got {data['count']}"
assert "rice" in data["supported_crops"], "rice should be in supported crops"
assert "cotton" not in data["supported_crops"], "cotton should be excluded due to non-standard units"
assert "coconut" not in data["supported_crops"], "coconut should be excluded due to non-standard units"

# 3. Crop Recommendation
recommendation_payload = {
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": 20.8,
    "humidity": 82.0,
    "ph": 6.5,
    "rainfall": 202.9
}
status, rec_data = test_post("/crop-recommendation", recommendation_payload)
assert status == 200, f"Expected 200, got {status}"
assert "recommended_crop" in rec_data

# 4. Yield Prediction - Supported Crop (rice)
yield_supported = {
    "crop": "rice",
    "state": "assam",
    "season": "whole year",
    "area": 1000.0,
    "annual_rainfall": 2000.0,
    "fertilizer": 150.0,
    "pesticide": 10.0
}
status, y_data = test_post("/yield-prediction", yield_supported)
assert status == 200, f"Expected 200, got {status}"
assert y_data["yield_available"] is True, "yield_available should be True for rice"
assert y_data["predicted_yield_tons_per_ha"] is not None
assert y_data["yield_message"] is None

# 5. Yield Prediction - Canonical Mapping (blackgram -> urad)
yield_mapped = {
    "crop": "blackgram",
    "state": "assam",
    "season": "whole year",
    "area": 1000.0,
    "annual_rainfall": 2000.0,
    "fertilizer": 150.0,
    "pesticide": 10.0
}
status, m_data = test_post("/yield-prediction", yield_mapped)
assert status == 200, f"Expected 200, got {status}"
assert m_data["yield_available"] is True, "yield_available should be True for blackgram (mapped to urad)"
assert m_data["predicted_yield_tons_per_ha"] is not None

# 6. Yield Prediction - Unsupported Crop (apple)
yield_unsupported = {
    "crop": "apple",
    "state": "assam",
    "season": "whole year",
    "area": 1000.0,
    "annual_rainfall": 2000.0,
    "fertilizer": 150.0,
    "pesticide": 10.0
}
status, u_data = test_post("/yield-prediction", yield_unsupported)
assert status == 200, f"Expected 200, got {status}"
assert u_data["yield_available"] is False, "yield_available should be False for apple"
assert u_data["predicted_yield_tons_per_ha"] is None
assert u_data["yield_message"] == "No reliable yield data for this crop"

# 7. Yield Prediction - Completely Invalid Crop (xyz_invalid -> 422)
yield_invalid = {
    "crop": "xyz_invalid",
    "state": "assam",
    "season": "whole year",
    "area": 1000.0,
    "annual_rainfall": 2000.0,
    "fertilizer": 150.0,
    "pesticide": 10.0
}
status, _ = test_post("/yield-prediction", yield_invalid)
assert status == 422, f"Expected 422 for invalid crop, got {status}"

# 8. Combined Prediction (Rice input -> yield available)
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
status, c_data = test_post("/predict", combined_payload)
assert status == 200, f"Expected 200, got {status}"
assert c_data["recommended_crop"] == "rice"
assert c_data["yield_available"] is True
assert c_data["predicted_yield_tons_per_ha"] is not None

# 9. Combined Prediction (Apple input -> yield unavailable)
apple_combined_payload = {
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
}
status, a_data = test_post("/smart-predict", apple_combined_payload)
assert status == 200, f"Expected 200, got {status}"
assert a_data["recommended_crop"] == "apple"
assert a_data["yield_available"] is False
assert a_data["predicted_yield_tons_per_ha"] is None
assert a_data["yield_message"] == "No reliable yield data for this crop"

print("\nALL ENDPOINT TESTS PASSED SUCCESSFULLY!")

# 9. Combined Prediction (Apple input -> yield unavailable)
apple_combined_payload = {
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
}
status, a_data = test_post("/smart-predict", apple_combined_payload)
assert status == 200, f"Expected 200, got {status}"
assert a_data["recommended_crop"] == "apple"
assert a_data["yield_available"] is False
assert a_data["predicted_yield_tons_per_ha"] is None
assert a_data["yield_message"] == "No reliable yield data for this crop"

print("\nALL ENDPOINT TESTS PASSED SUCCESSFULLY!")

