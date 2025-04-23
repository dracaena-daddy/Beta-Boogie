import yfinance as yf
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from requests.exceptions import HTTPError
from arch import arch_model
import requests 

def compute_var_stddev(portfolio_returns):
    """Quickly compute some returns and var (not actually used in final implementation)"""
    stddev = np.std(portfolio_returns)
    var_95 = np.percentile(portfolio_returns, 5)
    return var_95, stddev

def get_portfolio_returns(portfolio, start_date=None, end_date=None):
    """Fetch weighted portfolio returns for a given set of tickers and weights
    Returns a tuple where the first element is a dataframe containing the returns 
    for a given set of tickers over a given period and the second element is a 
    list containing the invalid ticker symbols"""

    if end_date is None:
        end_date = datetime.today().date()
    if start_date is None:
        start_date = end_date - timedelta(days=5 * 365)

    valid_tickers = []
    valid_weights = []
    invalid_tickers = []

    for item in portfolio:
        ticker = item.ticker
        weight = item.weight
        try:
            print(f"Fetching data for {ticker}...")
            data = yf.download(ticker, start=start_date, end=end_date)

            if data is None or data.empty or 'Close' not in data.columns:
                print(f"⚠️ No closing data for {ticker}. Skipping.")
                invalid_tickers.append(ticker)
                continue

            valid_tickers.append(ticker)
            valid_weights.append(weight)

        except HTTPError as http_err:
            print(f"❌ HTTP error for {ticker}: {http_err}")
            invalid_tickers.append(ticker)
        except Exception as e:
            print(f"❌ Error fetching data for {ticker}: {e}")
            invalid_tickers.append(ticker)

    if not valid_tickers:
        print("No valid tickers provided. Returning empty result.")
        return pd.Series(dtype=float), invalid_tickers

    print(f"\n✅ Downloading final price data for: {valid_tickers}")
    data = yf.download(valid_tickers, start=start_date, end=end_date)['Close']

    if isinstance(data, pd.Series):
        data = data.to_frame()

    # Fill missing values with 0 to prevent dropped columns
    data = data.fillna(0)

    # Compute returns
    returns = data.pct_change().dropna()

    # Check for silently dropped tickers
    returns_tickers = list(returns.columns)
    silently_dropped = [t for t in valid_tickers if t not in returns_tickers]

    if silently_dropped:
        print("\n⚠️ Tickers silently dropped from returns due to missing or invalid data:")
        for t in silently_dropped:
            print(f" - {t}")
    else:
        print("\n✅ No tickers were silently dropped. All expected tickers are in returns.")

    # Align weights
    final_tickers = list(returns.columns)
    aligned_weights = []
    for ticker in final_tickers:
        idx = valid_tickers.index(ticker)
        aligned_weights.append(valid_weights[idx])

    weights_array = np.array(aligned_weights)
    weights_array = weights_array / weights_array.sum()

    portfolio_returns = returns.dot(weights_array)

    print("\n📊 Weighted portfolio returns computed.")
    return portfolio_returns, invalid_tickers

def compute_risk_metrics(weighted_portfolio_returns, method: str):
    """Compute various financial risk metrics. 
    portfolio_returns is a series of weighted daily returns"""
    method = method.lower()
    try:
        if method == "historical":
            historical_volatility = compute_historical_volatility(weighted_portfolio_returns)  # use default values for now
            latest_vol = historical_volatility.dropna().iloc[-1]  # get the latest volatility
            stddev = float(np.std(historical_volatility))

            # compute metrics
            historical_var_95 = compute_VaR(latest_vol)
            historical_cvar_95 = compute_CVaR(latest_vol)
            historical_sharpe_ratio = compute_sharpe_ratio(weighted_portfolio_returns, latest_vol)
            historical_sortino_ratio = compute_sortino(weighted_portfolio_returns)
            historical_max_drawdown = compute_max_drawdown(weighted_portfolio_returns)

            return {
                "method": method, 
                "stddev": stddev,
                "var_95": historical_var_95,
                "cvar_95": historical_cvar_95,
                "sharpe_ratio": historical_sharpe_ratio,
                "sortino_ratio": historical_sortino_ratio,
                "max_drawdown": historical_max_drawdown
            }

        elif method == "ewma":
            ewma_volatility = compute_ewma_volatility(weighted_portfolio_returns)
            ewma_var_95 = compute_VaR(ewma_volatility)
            ewma_cvar_95 = compute_CVaR(ewma_volatility)
            ewma_sharpe_ratio = compute_sharpe_ratio(weighted_portfolio_returns, ewma_volatility)
            ewma_sortino_ratio = compute_sortino(weighted_portfolio_returns)
            ewma_max_drawdown = compute_max_drawdown(weighted_portfolio_returns)
            return {
                "method": method, 
                "stddev": ewma_volatility,
                "var_95": ewma_var_95,
                "cvar_95": ewma_cvar_95,
                "sharpe_ratio": ewma_sharpe_ratio,
                "sortino_ratio": ewma_sortino_ratio,
                "max_drawdown": ewma_max_drawdown
            }

        elif method == "garch":
            garch_volatility = compute_garch_volatility(weighted_portfolio_returns)
            garch_var_95 = compute_VaR(garch_volatility) 
            garch_cvar_95 = compute_CVaR(garch_volatility)
            garch_sharpe_ratio = compute_sharpe_ratio(weighted_portfolio_returns, garch_volatility)
            garch_sortino_ratio = compute_sortino(weighted_portfolio_returns)
            garch_max_drawdown = compute_max_drawdown(weighted_portfolio_returns)
            return {
                "method": method, 
                "stddev": garch_volatility,
                "var_95": garch_var_95,
                "cvar_95": garch_cvar_95,
                "sharpe_ratio": garch_sharpe_ratio,
                "sortino_ratio": garch_sortino_ratio,
                "max_drawdown": garch_max_drawdown
            }

        # TODO: Complete the final metrics 
        elif method == "lstm":
            lstm_volatility = fetch_lstm_volatility(weighted_portfolio_returns[-20:].tolist())
            return {
                "method": method,
                "stddev": lstm_volatility,
            }

        elif method == "cnn":
            return {"method": method, "message": "CNN model not implemented yet."}

        elif method == "text_embeddings":
            return {"method": method, "message": "Text embedding-based volatility not implemented yet."}

        elif method == "llm_narrative":
            return {"method": method, "message": "LLM-generated volatility narrative not implemented yet."}

        else:
            return {"method": method, "message": "Unknown method."}
    except Exception as e:
        return {"method": method, "message": f"Error: {str(e)}"}


def compute_historical_volatility(portfolio_returns: pd.Series, lookback: int = 30, annualize: bool = False) -> pd.Series:
    """
    Compute historical (rolling) volatility for a given portfolio returns series.
    
    Parameters:
    - portfolio_returns: pd.Series of daily log or percentage returns.
    - lookback: rolling window size (in days).
    - annualize: whether to scale by sqrt(252) for annual volatility.
    
    Returns:
    - pd.Series of rolling volatility values.
    """
    rolling_std = portfolio_returns.rolling(window=lookback).std()

    # return the time series of volatility values, but we'll only use the most
    # recent one to compute VaR
    if annualize:
        return rolling_std * np.sqrt(252)
    return rolling_std 

def compute_VaR(volatility):
    """Compute the 95% VaR"""
    z_95 = 1.65
    var_95 = -z_95 * volatility   # 95% VaR
    return var_95

def compute_CVaR(volatility):
    """Compute the 95% CVaR"""
    cvar_multiplier_95 = 2.06  # precomputed from normal distribution
    cvar_95 = -cvar_multiplier_95 * volatility   # 95% CVaR
    return cvar_95

def compute_sharpe_ratio(weighted_returns, volatility):
    """Compute the sharpe ratio (daily)"""
    # compute sharpe ratio (already annualized)
    mean_daily_return = weighted_returns.mean()
    risk_free_rate_daily = 0.02 / 252
    sharpe_ratio = (mean_daily_return - risk_free_rate_daily) / volatility
    return sharpe_ratio

def compute_sortino(weighted_returns):
    """Compute Sortino Ratio (annualized)"""
    risk_free_rate_daily = 0.02 / 252
    downside_returns = weighted_returns[weighted_returns < risk_free_rate_daily]
    downside_std = downside_returns.std()
    mean_daily_return = weighted_returns.mean()
    sortino_ratio = (mean_daily_return - risk_free_rate_daily) / downside_std if downside_std != 0 else np.nan
    sortino_annualized = sortino_ratio * np.sqrt(252)
    return sortino_annualized

def compute_max_drawdown(weighted_returns):
    """Compute the Maximum Drawdown"""
    cumulative = (1 + weighted_returns).cumprod()
    peak = cumulative.cummax()
    drawdown = (cumulative - peak) / peak
    max_drawdown = float(drawdown.min())
    return max_drawdown

def compute_garch_volatility(returns: pd.Series) -> float:
    """
    Fit a GARCH(1,1) model and return annualized volatility.
    """
    # Scale to percentage returns if necessary
    if returns.mean() < 1:
        returns *= 100
    
    model = arch_model(returns, vol='Garch', p=1, q=1, rescale=False)
    res = model.fit(disp="off")

    # Get the conditional volatility forecast for the next day
    forecast = res.forecast(horizon=1)
    daily_vol = np.sqrt(forecast.variance.values[-1, 0])

    # Annualize volatility (252 trading days)
    annualized_vol = daily_vol * np.sqrt(252)
    return annualized_vol / 100  # Return in decimal form

def compute_ewma_volatility(returns: pd.Series, lambda_: float = 0.94) -> float:
    """
    Computes annualized volatility using EWMA.
    """
    # Ensure returns are daily and in decimal form
    returns = returns.dropna()
    
    weights = np.array([(1 - lambda_) * (lambda_ ** i) for i in range(len(returns) - 1, -1, -1)])
    weights /= weights.sum()  # Normalize weights

    weighted_mean = np.average(returns, weights=weights)
    weighted_var = np.average((returns - weighted_mean) ** 2, weights=weights)

    # Annualize
    ewma_vol = np.sqrt(weighted_var) * np.sqrt(252)
    return ewma_vol

def fetch_lstm_volatility(returns_20_day: list[float]) -> float:
    try:
        response = requests.post(
            "http://localhost:8001/predict",
            json={"returns": returns_20_day}
        )
        response.raise_for_status()
        return response.json()["volatility"]
    except Exception as e:
        print(f"[ERROR] Failed to fetch LSTM volatility: {e}")
        return None