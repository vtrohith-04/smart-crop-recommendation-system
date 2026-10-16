import json
from app.schemas import RECOMMENDER_CROPS, CANONICAL_CROP_MAP, normalize_crop_name, YieldPredictionInput
from app.services.prediction_service import PredictionService
from app.models.model_loader import model_loader

# Ensure models are loaded
model_loader.load_artifacts()

print("Evaluating 22 recommender crops through PredictionService:")
results = []
for crop in RECOMMENDER_CROPS:
    mapped = normalize_crop_name(crop)
    payload = YieldPredictionInput(
        crop=crop,
        state="assam",
        season="whole year",
        area=1000.0,
        annual_rainfall=2000.0,
        fertilizer=150.0,
        pesticide=10.0
    )
    res = PredictionService.get_yield_prediction(payload)
    supported_str = "Yes" if res["yield_available"] else "No"
    yield_val = f"{res['predicted_yield_tons_per_ha']} t/ha" if res["yield_available"] else res["yield_message"]
    results.append({
        "crop": crop,
        "mapped": mapped,
        "supported": supported_str,
        "yield_available": res["yield_available"],
        "predicted_yield": res["predicted_yield_tons_per_ha"],
        "expected_production": res["expected_production_tons"],
        "response_summary": yield_val
    })

header = f"| {'Recommender Crop':<16} | {'Mapped Name':<20} | {'Supported?':<12} | {'Yield Available':<17} | {'Response':<36} |"
divider = f"|{'-'*18}|{'-'*22}|{'-'*14}|{'-'*19}|{'-'*38}|"
print(header)
print(divider)
for r in results:
    row = f"| {r['crop']:<16} | {r['mapped']:<20} | {r['supported']:<12} | {str(r['yield_available']):<17} | {r['response_summary']:<36} |"
    print(row)

# Also dump json for verification
with open("crop_evaluation_summary.json", "w") as f:
    json.dump(results, f, indent=2)

