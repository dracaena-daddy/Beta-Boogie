import requests
import numpy as np

test_returns = list(np.random.normal(0, 0.01, 20))
response = requests.post("http://localhost:8000/predict", json={"returns": test_returns})
print(response.json())
