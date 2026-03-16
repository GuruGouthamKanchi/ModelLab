import requests
import json
import os

print("Creating fake dataset...")
with open("test_dataset.csv", "w") as f:
    f.write("A,B,C,Cat\n")
    f.write("1,2.5,10,Red\n")
    f.write(",3.5,20,Blue\n")
    f.write("3,,,Green\n")
    f.write("4,5.5,40,Red\n")
    f.write("5,6.5,50,\n")

print("1. Testing /analyze...")
res_analyze = requests.post("http://localhost:8000/analyze", json={
    "dataset_path": os.path.abspath("test_dataset.csv")
})
print(f"Status: {res_analyze.status_code}")
print(json.dumps(res_analyze.json(), indent=2))

print("\n2. Testing /clean...")
res_clean = requests.post("http://localhost:8000/clean", json={
    "dataset_path": os.path.abspath("test_dataset.csv"),
    "fill_missing": "mean",
    "encode_categorical": True
})
print(f"Status: {res_clean.status_code}")
print(json.dumps(res_clean.json(), indent=2))
