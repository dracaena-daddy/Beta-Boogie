# lstm_service.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
import numpy as np
from model import LSTMVolatilityModel

app = FastAPI()

# Load model
model = LSTMVolatilityModel()
model.load_state_dict(torch.load("lstm_volatility_model.pt", map_location=torch.device("cpu")))
model.eval()

# Pydantic schema for incoming request
class PredictRequest(BaseModel):
    returns: list[float]

@app.post("/predict")
def predict_volatility(data: PredictRequest):
    if len(data.returns) != 20:
        raise HTTPException(status_code=400, detail="Input must be a list of exactly 20 returns.")

    input_tensor = torch.tensor(data.returns, dtype=torch.float32).reshape(1, 20, 1)

    with torch.no_grad():
        prediction = model(input_tensor).item()

    return {"volatility": prediction}
