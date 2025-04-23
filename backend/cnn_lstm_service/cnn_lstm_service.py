# cnn_lstm_service/cnn_lstm_service.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
from model import CNNLSTMVolatilityModel

app = FastAPI()

# Load model
model = CNNLSTMVolatilityModel()
model.load_state_dict(torch.load("cnn_lstm_volatility_model.pt", map_location=torch.device("cpu")))
model.eval()

class PredictRequest(BaseModel):
    returns: list[float]

@app.post("/predict")
def predict_volatility(data: PredictRequest):
    if len(data.returns) != 20:
        raise HTTPException(status_code=400, detail="Must provide exactly 20 returns")
    
    input_tensor = torch.tensor(data.returns, dtype=torch.float32).view(1, 20, 1)
    with torch.no_grad():
        prediction = model(input_tensor).item()
    
    return {"volatility": prediction}
