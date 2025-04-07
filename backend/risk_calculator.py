import yfinance as yf
import numpy as np
import pandas as pd

def get_portfolio_returns(portfolio, start_date, end_date):
    """Fetch portfolio returns for a given set of tickers"""
    tickers = [item.ticker for item in portfolio]
    weights = np.array([item.weight for item in portfolio])

    data = yf.download(tickers, start=start_date, end=end_date)['Close']
    returns = data.pct_change().dropna()

    if isinstance(data, pd.Series):  # if only one ticker
        returns = returns.to_frame()

    portfolio_returns = returns.dot(weights)
    return portfolio_returns

def compute_var_stddev(portfolio_returns):
    """Quickly compute some returns and var (not actually used in final implementation)"""
    stddev = np.std(portfolio_returns)
    var_95 = np.percentile(portfolio_returns, 5)
    return var_95, stddev