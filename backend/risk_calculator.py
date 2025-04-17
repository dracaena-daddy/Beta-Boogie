import yfinance as yf
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from requests.exceptions import HTTPError

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

def compute_risk_metrics(portfolio_returns, method: str):
    """Compute various financial risk metrics. 
    portfolio_returns is a series of weighted daily returns"""
    method = method.lower()
    try:
        if method == "historical":
            historical_volatility = compute_historical_volatility(portfolio_returns)  # use default values for now
            latest_vol = historical_volatility.dropna().iloc[-1]  # get the latest volatility
            stddev = float(np.std(historical_volatility))

            # compute metrics
            var_95 = compute_VaR(latest_vol)
            cvar_95 = compute_CVaR(latest_vol)
            sharpe_ratio = compute_sharpe_ratio(portfolio_returns, latest_vol)
            sortino_ratio = compute_sortino(portfolio_returns)
            max_drawdown = compute_max_drawdown(portfolio_returns)

            # print results
            print(f"Latest Vol: {latest_vol}, VaR95: {var_95}, CVaR95: {cvar_95}")
            print(f"Sharpe Ratio: {sharpe_ratio}, Sortino Ratio: {sortino_ratio}")
            print(f"Max drawdown: {max_drawdown}")
            return {
                "method": method, 
                "stddev": stddev,
                "var_95": var_95,
                "cvar_95": cvar_95,
                "sharpe_ratio": sharpe_ratio,
                "sortino_ratio": sortino_ratio,
                "max_drawdown": max_drawdown
            }

        elif method == "ewma":
            lambda_ = 0.94
            squared_returns = portfolio_returns**2
            ewma_variance = squared_returns.ewm(alpha=1 - lambda_).mean()
            stddev = float(np.sqrt(ewma_variance.iloc[-1]))
            var_95 = float(np.percentile(portfolio_returns, 5))
            return {"method": method, "stddev": stddev, "var_95": var_95}

        elif method == "garch":
            from arch import arch_model
            model = arch_model(portfolio_returns * 100, vol='Garch', p=1, q=1)
            fitted = model.fit(disp="off")
            forecast = fitted.forecast(horizon=1)
            stddev = float(np.sqrt(forecast.variance.values[-1, 0]) / 100)
            var_95 = float(np.percentile(portfolio_returns, 5))
            return {"method": method, "stddev": stddev, "var_95": var_95}

        elif method == "lstm":
            return {"method": method, "message": "LSTM model not implemented yet."}

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

def compute_VaR(latest_vol):
    """Compute the 95% VaR"""
    z_95 = 1.65
    var_95 = -z_95 * latest_vol   # 95% VaR
    return var_95

def compute_CVaR(latest_vol):
    """Compute the 95% CVaR"""
    cvar_multiplier_95 = 2.06  # precomputed from normal distribution
    cvar_95 = -cvar_multiplier_95 * latest_vol   # 95% CVaR
    return cvar_95

def compute_sharpe_ratio(weighted_returns, latest_vol):
    """Compute the sharpe ratio (daily)"""
    # compute sharpe ratio (already annualized)
    mean_daily_return = weighted_returns.mean()
    risk_free_rate_daily = 0.02 / 252
    sharpe_ratio = (mean_daily_return - risk_free_rate_daily) / latest_vol
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
