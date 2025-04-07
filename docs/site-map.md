🗺️ Beta Boogie Site Map

This document outlines the structure of the Beta Boogie web application, including each page, its route, its purpose, and how users navigate between them.

📄 Pages & Routes

Route

Page Name

Description

/

Landing Page

Welcome screen with app overview, CTA to start analyzing or login

/analyze

Portfolio Analyzer

Main analysis interface: tickers, weights, dates, VaR & volatility methods

/dashboard

User Dashboard

View saved portfolios, past analysis results

/login

Login

Sign in for returning users

/signup

Signup

Create a new account

/account

Account Settings

Update user info, preferences, etc.

/docs

User Docs

How it works, model info, methodology summary

/404

Not Found Page

Auto-rendered by Next.js when route is not found

🔀 Navigation Flow

Landing Page (/)

Call-to-action to "Start Analyzing" or "Login"

Optional links to /docs or GitHub

Portfolio Analyzer (/analyze)

Main tool: enter tickers, weights, and dates

Choose volatility method

Run analysis → get results + visualization

If not logged in → prompt to create account to save results

Authentication (/login, /signup)

Sign in or register

Redirect to /dashboard after successful login

Dashboard (/dashboard)

View saved portfolios and past analyses

Click into any analysis to re-run or edit

Account Page (/account)

Update email, password, analysis preferences (e.g. default volatility method)

User Docs (/docs)

Overview of how VaR and volatility are calculated

List of supported methods and how to interpret the output

🧱 Component-Page Association

Component

Appears On

<TickerInputRow />

/analyze

<WeightSummary />

/analyze

<ResultCard />

/analyze, /dashboard/:id

<VolatilitySelector />

/analyze, /account (preference)

<NavigationBar />

All pages

<DocsSection />

/docs

This structure ensures a clean, modular SPA experience with distinct separation between analysis, user data, and reference material. Future routes can be added for changelog, reports, or api-docs if needed.
