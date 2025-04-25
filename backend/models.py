from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import ARRAY
from datetime import datetime
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Float 



class TickerWeight(BaseModel):
    """Model for ticker symbol and corresponding weight"""
    ticker: str
    weight: float

class RiskRequest(BaseModel):
    """A request model that contains a list of ticker weights, dates, and desired analysis"""
    portfolio: List[TickerWeight]
    start_date: date
    end_date: date
    #analysis_type: List[str]
    methods: List[str]  # ✅ New field from frontend

class MethodResult(BaseModel):
    method: str
    stddev: Optional[float] = None
    var_95: Optional[float] = None
    cvar_95: Optional[float] = None
    sharpe_ratio: Optional[float] = None
    sortino_ratio: Optional[float] = None
    max_drawdown: Optional[float] = None
    message: Optional[str] = None

class RiskResponse(BaseModel):
    """Return 95% VaR and standard deviation"""
    # var_95: float
    # stddev: float
    # returns: List[float]
    results: List[MethodResult]
    returns: Optional[List[float]] = None
    invalid_tickers: Optional[List[str]] = None



# models.py
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True)
    user_id = Column(String, index=True)
    name = Column(String)
    tickers = Column(ARRAY(String))
    weights = Column(ARRAY(Float))
    start_date = Column(String)
    end_date = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True)
    user_id = Column(String, index=True)
    name = Column(String)
    tickers = Column(ARRAY(String))
    weights = Column(ARRAY(Float))
    start_date = Column(String)
    end_date = Column(String)
    method = Column(String, nullable=False)
    stddev = Column(Float, nullable=True)
    var_95 = Column(Float, nullable=True)
    cvar_95 = Column(Float, nullable=True)
    sharpe_ratio = Column(Float, nullable=True)
    sortino_ratio = Column(Float, nullable=True)
    max_drawdown = Column(Float, nullable=True)
    returns = Column(ARRAY(Float))
    created_at = Column(DateTime, default=datetime.utcnow)

class InterpretationRequest(BaseModel):
    method: str
    name: str
    metrics: dict