# Beta Boogie Roadmap

Welcome to the official roadmap for Beta Boogie, a financial risk analytics web application. Below is an overview of planned milestones, feature drops, and upcoming enhancements. This file is actively updated during development.

Feature Drops (tentative)

| Version | Name                | Highlights                                                                 |
|---------|---------------------|---------------------------------------------------------------------------|
| v0.1.0  | 🎧 Initial Boogie   | MVP VaR analysis with frontend/backend integration, histogram visualization |
| v0.2.0  | 📉 Volatility Vault | Added rolling standard deviation, EWMA, and a method selector             |
| v0.3.0  | 🔐 Boogie Dashboard | User auth, account system, and saved portfolio dashboard                   |
| v0.4.0  | 🧾 Report Drop      | Export downloadable PDFs/CSVs of user analyses                            |
| v1.0.0  | 🌐 Beta Goes Big    | Full SPA with real-time volatility plots, multi-method modeling, saved sessions |
| v2.0.0  | 🤖 Deep Boogie      | LSTM + Transformer-based volatility modeling, AI-generated reports        |


Planned Feature Milestones

###  Core Web App Structure
- [X] SPA routing with Next.js App Router
- [X] Core form for VaR analysis
- [X] Component-based layout + UI polish

###  User Account Features
- [X] Login/Signup flow
- [] Persist user portfolios to DB
- [ ] Per-user saved analysis history

###  Risk Analysis Engine
- [ ] VaR with historical simulation
- [ ] Standard deviation over time
- [ ] EWMA volatility
- [ ] GARCH(1,1) modeling

###  Reports & Exports
- [ ] PDF export of analysis results
- [ ] CSV download

###  Advanced Methods
- [ ] LSTM + CNN-LSTM forecasting
- [ ] Transformer-based models (Informer / PatchTST)
- [ ] Bayesian Deep Learning (MC Dropout)