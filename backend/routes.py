# API routes live here
# routes.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from db import get_db
from models import Portfolio
from datetime import datetime

router = APIRouter()

class PortfolioIn(BaseModel):
    userId: str
    name: str
    tickers: List[str]
    weights: List[float]
    startDate: str
    endDate: str

# API route to accept POST request from frontend to save portfolio data
@router.post("/api/save-portfolio")
def save_portfolio(data: PortfolioIn, db: Session = Depends(get_db)):
    try:
        new_portfolio = Portfolio(
            user_id=data.userId,
            name=data.name,
            tickers=data.tickers,
            weights=data.weights,
            start_date=data.startDate,
            end_date=data.endDate,
            created_at=datetime.utcnow(),
        )
        db.add(new_portfolio)
        db.commit()
        db.refresh(new_portfolio)

        return {"success": True, "portfolioId": new_portfolio.id}
    except Exception as e:
        print("❌ Failed to save portfolio:", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")
