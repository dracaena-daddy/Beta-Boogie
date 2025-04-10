from pydantic import BaseModel
from typing import List
from datetime import date
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import ARRAY
from datetime import datetime
from sqlalchemy.orm import declarative_base
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
    analysis_type: List[str]

class RiskResponse(BaseModel):
    """Return 95% VaR and standard deviation"""
    var_95: float
    stddev: float
    returns: List[float]

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

    # Portfolio details
    name = Column(String)
    tickers = Column(ARRAY(String))
    weights = Column(ARRAY(Float))
    start_date = Column(String)
    end_date = Column(String)
    returns = Column(ARRAY(Float))

    # Analysis results
    var = Column(Float)
    stdev = Column(Float)

    created_at = Column(DateTime, default=datetime.utcnow)
