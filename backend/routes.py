# API routes live here
# routes.py
from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from db import get_db
from models import Portfolio, Analysis
from datetime import datetime
from auth import verify_clerk_token

router = APIRouter()

# PORTFOLIO ROUTES
class PortfolioIn(BaseModel):
    userId: str
    name: str
    tickers: List[str]
    weights: List[float]
    startDate: str
    endDate: str

# API route to accept POST request from frontend to save portfolio data
@router.post("/api/save-portfolio")
def save_portfolio(request: Request, data: PortfolioIn, db: Session = Depends(get_db)):
    user_id_from_token = verify_clerk_token(request)

    if user_id_from_token != data.userId:
        raise HTTPException(status_code=403, detail="Unauthorized user")

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

# API route to load a logged in user's portfolio
@router.get("/api/load-portfolios")
def load_portfolios(request: Request, db: Session = Depends(get_db)):
    # grab the user id from the token
    user_id = verify_clerk_token(request)

    # retrieve the user's saved portfolios
    portfolios = db.query(Portfolio).filter(Portfolio.user_id == user_id).all()

    # return json object with portfolio(s) to the frontend
    return [
        {
            "id": p.id,
            "name": p.name,
            "tickers": p.tickers,
            "weights": p.weights,
            "startDate": p.start_date,
            "endDate": p.end_date,
            "createdAt": p.created_at.isoformat(),
        }
        for p in portfolios
    ]

# API route to delete the given portfolio
@router.delete("/api/delete-portfolio/{portfolio_id}")
def delete_portfolio(portfolio_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = verify_clerk_token(request)

    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()

    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    if portfolio.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    db.delete(portfolio)
    db.commit()

    return {"success": True, "message": "Portfolio deleted"}

# ANALYSIS ROUTES
class AnalysisIn(BaseModel):
    name: str
    tickers: List[str]
    weights: List[float]
    startDate: str
    endDate: str
    var: float
    stdev: float

@router.post("/api/save-analysis")
def save_analysis(data: AnalysisIn, request: Request, db: Session = Depends(get_db)):
    user_id = verify_clerk_token(request)

    new_analysis = Analysis(
        user_id=user_id,
        name=data.name,
        tickers=data.tickers,
        weights=data.weights,
        start_date=data.startDate,
        end_date=data.endDate,
        var=data.var,
        stdev=data.stdev,
        created_at=datetime.utcnow(),
    )

    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)

    return {"success": True, "analysisId": new_analysis.id}

@router.get("/api/load-analyses")
def load_analyses(request: Request, db: Session = Depends(get_db)):
    user_id = verify_clerk_token(request)

    analyses = db.query(Analysis).filter(Analysis.user_id == user_id).all()

    return [
        {
            "id": a.id,
            "name": a.name,
            "tickers": a.tickers,
            "weights": a.weights,
            "start_date": a.start_date,
            "end_date": a.end_date,
            "var": a.var,
            "stdev": a.stdev,
            "created_at": a.created_at.isoformat(),
        }
        for a in analyses
    ]

@router.delete("/api/delete-analysis/{analysis_id}")
def delete_analysis(analysis_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = verify_clerk_token(request)

    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    if analysis.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    db.delete(analysis)
    db.commit()

    return {"success": True, "message": "Analysis deleted"}

