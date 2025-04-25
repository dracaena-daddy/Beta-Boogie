import requests

url = "http://localhost:8000/api/interpret-analysis"  # adjust if you're using a different port

payload = {
    "method": "LSTM",
    "name": "Tech Growth Portfolio",
    "metrics": {
        "var_95": -0.0132,
        "cvar_95": -0.0165,
        "volatility": 0.0089,
        "sharpe_ratio": 0.1385,
        "sortino_ratio": 1.1819,
        "max_drawdown": -31.43
    }
}

response = requests.post(url, json=payload)

if response.status_code == 200:
    print("✅ Interpretation:\n")
    print(response.json()["interpretation"])
else:
    print(f"❌ Error ({response.status_code}): {response.text}")
