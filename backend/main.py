from fastapi import FastAPI
from db import engine
from models import RiskRequest, RiskResponse, Base
from risk_calculator import get_portfolio_returns, compute_var_stddev
from fastapi.middleware.cors import CORSMiddleware
from routes import router as portfolio_router
from pydantic import BaseModel
import pandas as pd

# create an instance of FastAPI
app = FastAPI()

# execute some start up code
@app.on_event("startup")
def on_startup():
    print("📦 Creating tables if they don't exist...")
    Base.metadata.create_all(bind=engine)

# register API route to save portfolio data
app.include_router(portfolio_router)

# needed to allow frontend and backend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import JSONResponse
# define computations for when API endpoint /api/risk receives a POST request
# @app.post("/api/risk", response_model=RiskResponse)
# def calculate_risk(request: RiskRequest):
#     portfolio_returns = get_portfolio_returns(
#         request.portfolio,
#         request.start_date,
#         request.end_date
#     )
#     var_95, stddev = compute_var_stddev(portfolio_returns)
#     return RiskResponse(
#     var_95=var_95,
#     stddev=stddev,
#     returns=portfolio_returns.tolist()
#     )


@app.post("/api/risk")
def calculate_risk(request: RiskRequest):
    portfolio_returns, invalid_tickers = get_portfolio_returns(
        request.portfolio,
        request.start_date,
        request.end_date
    )
    var_95, stddev = compute_var_stddev(portfolio_returns)
    return {
        "var_95": var_95,
        "stddev": stddev,
        "returns": portfolio_returns.tolist(),
        "invalid_tickers": invalid_tickers
    }