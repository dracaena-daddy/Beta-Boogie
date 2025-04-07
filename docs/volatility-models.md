# Volatility Models in Beta Boogie

Beta Boogie supports a growing set of methods to measure and analyze portfolio volatility. Each method gives unique insight into the market risk associated with a given portfolio.

🔜 Coming Soon

1. Rolling Standard Deviation

Simple standard deviation over a fixed lookback window (e.g., 30 days)

Easy to compute, intuitive to interpret

2. EWMA (Exponentially Weighted Moving Average)

Uses more weight for recent returns

Good for capturing volatility shifts

Controlled by smoothing factor lambda (or span)


3. GARCH (Generalized Autoregressive Conditional Heteroskedasticity)

Models volatility as dependent on past squared returns and past variance

Captures "volatility clustering"

Implemented with Python's arch package


4. Stochastic Volatility

Models volatility as a latent process

Often used in derivatives pricing


## Experimental Methods (Planned)

### Deep Learning

LSTM for time-series volatility prediction

CNN-LSTM hybrids for capturing short/long-term dependencies

### Transformer Models

PatchTST, Informer, and related architectures

Able to model long-range dependencies

### Bayesian Volatility Models

MC Dropout or variational inference

Gives uncertainty-aware forecasts
