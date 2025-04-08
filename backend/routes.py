# API routes live here
# routes.py
from fastapi import APIRouter, HTTPException, Depends, Request, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from db import get_db
from models import Portfolio, Analysis
from datetime import datetime
from auth import verify_clerk_token
from matplotlib import pyplot as plt
from io import BytesIO
from fpdf import FPDF
import matplotlib
matplotlib.use("Agg")  #  Headless, non-GUI backend
from matplotlib import pyplot as plt
import base64
from fastapi.responses import HTMLResponse



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
    returns: List[float]

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
        returns=data.returns,  # new part
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


class UpdateName(BaseModel):
    id: int
    name: str

@router.patch("/api/update-portfolio-name")
def update_portfolio_name(data: UpdateName, request: Request, db: Session = Depends(get_db)):
    user_id = verify_clerk_token(request)

    portfolio = db.query(Portfolio).filter(Portfolio.id == data.id).first()

    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    if portfolio.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    portfolio.name = data.name
    db.commit()

    return {"success": True, "message": "Portfolio name updated"}

@router.patch("/api/update-analysis-name")
def update_analysis_name(data: UpdateName, request: Request, db: Session = Depends(get_db)):
    user_id = verify_clerk_token(request)

    analysis = db.query(Analysis).filter(Analysis.id == data.id).first()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    if analysis.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    analysis.name = data.name
    db.commit()

    return {"success": True, "message": "Analysis name updated"}



# PDF ROUTES
@router.get("/api/export-analysis-pdf/{analysis_id}")
def export_analysis_pdf(analysis_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = verify_clerk_token(request)
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    if analysis.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # === Plot 1: Portfolio Weights ===
    fig1, ax1 = plt.subplots()
    ax1.bar(analysis.tickers, analysis.weights)
    ax1.set_title("Portfolio Weights")
    ax1.set_ylabel("Weight")
    ax1.set_xlabel("Ticker")
    plt.tight_layout()

    img1 = BytesIO()
    plt.savefig(img1, format='png')
    img1.seek(0)
    plot1_path = f"/tmp/plot_weights_{analysis_id}.png"
    with open(plot1_path, "wb") as f:
        f.write(img1.read())
    plt.close()

    # === Plot 2: VaR Distribution ===
    fig2, ax2 = plt.subplots()
    ax2.hist(analysis.returns, bins=50, color='skyblue', edgecolor='black', alpha=0.7)
    ax2.axvline(x=analysis.var, color='red', linestyle='--', linewidth=2, label=f"VaR = {analysis.var:.4f}")
    ax2.set_title("VaR Distribution of Returns")
    ax2.set_xlabel("Returns")
    ax2.set_ylabel("Frequency")
    ax2.legend()
    plt.tight_layout()

    img2 = BytesIO()
    plt.savefig(img2, format='png')
    img2.seek(0)
    plot2_path = f"/tmp/plot_var_{analysis_id}.png"
    with open(plot2_path, "wb") as f:
        f.write(img2.read())
    plt.close()

    # === Create PDF ===
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    pdf.cell(200, 10, txt=f"Analysis Report: {analysis.name}", ln=True)
    pdf.cell(200, 10, txt=f"Date Range: {analysis.start_date} to {analysis.end_date}", ln=True)
    pdf.cell(200, 10, txt=f"Tickers: {', '.join(analysis.tickers)}", ln=True)
    pdf.cell(200, 10, txt=f"Weights: {', '.join(str(w) for w in analysis.weights)}", ln=True)
    pdf.cell(200, 10, txt=f"VaR: {analysis.var}", ln=True)
    pdf.cell(200, 10, txt=f"StDev: {analysis.stdev}", ln=True)

    pdf.image(plot1_path, x=10, y=80, w=180)
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="VaR Distribution", ln=True)
    pdf.image(plot2_path, x=10, y=30, w=180)

    pdf_string = pdf.output(dest='S').encode('latin1')

    return Response(
        content=pdf_string,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=analysis_{analysis_id}.pdf"
        }
    )

@router.get("/api/export-analysis-html/{analysis_id}")
def export_analysis_html(analysis_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = verify_clerk_token(request)
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    if analysis.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Plot 1: Portfolio Weights
    fig1, ax1 = plt.subplots()
    ax1.bar(analysis.tickers, analysis.weights)
    ax1.set_title("Portfolio Weights")
    ax1.set_ylabel("Weight")
    ax1.set_xlabel("Ticker")
    plt.tight_layout()
    img1 = BytesIO()
    plt.savefig(img1, format='png')
    img1.seek(0)
    img1_b64 = base64.b64encode(img1.read()).decode('utf-8')
    plt.close()

    # Plot 2: VaR Distribution
    fig2, ax2 = plt.subplots()
    ax2.hist(analysis.returns, bins=50, color='skyblue', edgecolor='black', alpha=0.7)
    ax2.axvline(x=analysis.var, color='red', linestyle='--', linewidth=2, label=f"VaR = {analysis.var:.4f}")
    ax2.set_title("VaR Distribution of Returns")
    ax2.set_xlabel("Returns")
    ax2.set_ylabel("Frequency")
    ax2.legend()
    plt.tight_layout()
    img2 = BytesIO()
    plt.savefig(img2, format='png')
    img2.seek(0)
    img2_b64 = base64.b64encode(img2.read()).decode('utf-8')
    plt.close()

    # Create HTML
    html_content = f"""
    <html>
    <head>
        <title>Analysis Report - {analysis.name}</title>
        <style>
            body {{ font-family: Arial, sans-serif; padding: 2rem; background-color: #f8f8f8; color: #333; }}
            h1 {{ color: #9D4EDD; }}
            .plot {{ margin: 30px 0; }}
            .label {{ font-weight: bold; }}
        </style>
    </head>
    <body>
        <h1>Analysis Report: {analysis.name}</h1>
        <p><span class="label">Date Range:</span> {analysis.start_date} to {analysis.end_date}</p>
        <p><span class="label">Tickers:</span> {', '.join(analysis.tickers)}</p>
        <p><span class="label">Weights:</span> {', '.join(str(w) for w in analysis.weights)}</p>
        <p><span class="label">VaR:</span> {analysis.var}</p>
        <p><span class="label">StDev:</span> {analysis.stdev}</p>

        <div class="plot">
            <h2>Portfolio Weights</h2>
            <img src="data:image/png;base64,{img1_b64}" width="600"/>
        </div>

        <div class="plot">
            <h2>VaR Distribution</h2>
            <img src="data:image/png;base64,{img2_b64}" width="600"/>
        </div>
    </body>
    </html>
    """

    return HTMLResponse(content=html_content, status_code=200, headers={
        "Content-Disposition": f"attachment; filename=analysis_{analysis_id}.html"
    })