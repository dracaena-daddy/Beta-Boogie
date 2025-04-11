import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from requests.exceptions import HTTPError

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
        ticker = item['ticker']
        weight = item['weight']
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

    if invalid_tickers:
        print("\n⚠️ Invalid Tickers Skipped:")
        for t in invalid_tickers:
            print(f" - {t}")

    if not valid_tickers:
        print("No valid tickers provided. Returning empty result.")
        return pd.Series(dtype=float)

    print(f"\n✅ Downloading final price data for: {valid_tickers}")
    data = yf.download(valid_tickers, start=start_date, end=end_date)['Close']

    if isinstance(data, pd.Series):
        data = data.to_frame()

    data = data.dropna()
    returns = data.pct_change().dropna()

    weights_array = np.array(valid_weights)

    # Normalize weights only if tickers were dropped
    if len(valid_tickers) < len(portfolio):
        print("\nℹ️ Adjusting weights to account for dropped tickers.")
        weights_array = weights_array / weights_array.sum()

        # Print adjusted weights for transparency
        print("Adjusted Weights:")
        for ticker, weight in zip(valid_tickers, weights_array):
            print(f" - {ticker}: {weight:.4f}")
    else:
        print("\n✅ All tickers valid. Using original weights.")

    portfolio_returns = returns.dot(weights_array)

    print("\n📊 Weighted portfolio returns computed.")
    return portfolio_returns

# Example usage
portfolio = [
    {'ticker': 'AAPL', 'weight': 0.3},
    {'ticker': 'MSFT', 'weight': 0.3},
    {'ticker': 'GOOGL', 'weight': 0.2},
    {'ticker': 'INVALID123', 'weight': 0.1},
    {'ticker': 'TSLA', 'weight': 0.1}
]

returns_series = get_portfolio_returns(portfolio)

print("\n🔍 Sample Portfolio Returns:")
print(returns_series.head())
