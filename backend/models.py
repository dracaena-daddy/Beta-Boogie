from pydantic import BaseModel
from typing import List
from datetime import date

class TickerWeight(BaseModel):
    """Model for ticker symbol and corresponding weight"""
    ticker: str
    weight: float

class RiskRequest(BaseModel):
    """A request model that contains a list of ticker weights, dates, and desired analysis"""
    portfolio: List[TickerWeight]
    start_date: date
    end_date: date
    analysis_type: List[str]

class RiskResponse(BaseModel):
    """Return 95% VaR and standard deviation"""
    var_95: float
    stddev: float