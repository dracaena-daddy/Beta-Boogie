from fastapi import FastAPI
from models import RiskRequest, RiskResponse
from risk_calculator import get_portfolio_returns, compute_var_stddev
from fastapi.middleware.cors import CORSMiddleware

# create an instance of FastAPI
app = FastAPI()

# needed to allow frontend and backend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# define computations for when API endpoint /api/risk receives a POST request
@app.post("/api/risk", response_model=RiskResponse)
def calculate_risk(request: RiskRequest):
    portfolio_returns = get_portfolio_returns(
        request.portfolio,
        request.start_date,
        request.end_date
    )
    var_95, stddev = compute_var_stddev(portfolio_returns)
    return RiskResponse(
    var_95=var_95,
    stddev=stddev,
    returns=portfolio_returns.tolist()
)

