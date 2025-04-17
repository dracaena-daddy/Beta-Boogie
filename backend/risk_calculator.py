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
    """Fetch weighted portfolio returns for a given set of tickers and weights"""

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
    method = method.lower()
    try:
        if method == "historical":
            stddev = float(np.std(portfolio_returns))
            var_95 = float(np.percentile(portfolio_returns, 5))
            return {"method": method, "stddev": stddev, "var_95": var_95}

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