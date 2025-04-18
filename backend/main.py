from fastapi import FastAPI, HTTPException, Body
from db import engine
from models import RiskRequest, RiskResponse, Base
from risk_calculator import get_portfolio_returns, compute_var_stddev, compute_risk_metrics
from fastapi.middleware.cors import CORSMiddleware
from routes import router as portfolio_router

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

@app.post("/api/risk", response_model=RiskResponse)
async def calculate_risk(data: RiskRequest = Body(...)):
    try:
        # download data and build portfolio
        portfolio_returns, invalid_ticker = get_portfolio_returns(
            data.portfolio, 
            data.start_date,
            data.end_date
        )

        # compute risk metrics (portfolio returns is a dataframe...?)
        results = [compute_risk_metrics(portfolio_returns, method)
                   for method in data.methods]

        return {
            "results": results,
            "returns": portfolio_returns.tolist(),
            "invalid_tickers": invalid_ticker
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))