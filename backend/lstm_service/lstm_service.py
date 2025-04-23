# lstm_service.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
import numpy as np
# from model import LSTMVolatilityModel
import torch.nn as nn

class LSTMVolatilityModel(nn.Module):
    def __init__(self, input_size=1, hidden_size=50, num_layers=2):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        out, _ = self.lstm(x)
        out = out[:, -1, :]  # take the last time step
        return self.fc(out).squeeze()


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
