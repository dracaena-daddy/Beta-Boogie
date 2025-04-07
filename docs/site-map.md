# 🗺️ Site Map – Beta Boogie

This document outlines the full site structure, route paths, and navigation flow of the Beta Boogie application.

---

## 📄 Pages & Routes

| Route Path       | Page Name          | Purpose                                                                 |
|------------------|--------------------|-------------------------------------------------------------------------|
| `/`              | Landing Page       | Introduces Beta Boogie, its purpose, and guides users to login or analyze |
| `/analyze`       | Portfolio Analyzer | Main interface for inputting tickers, selecting volatility method, and viewing analysis |
| `/dashboard`     | User Dashboard     | Shows user's saved portfolios and previous analyses                     |
| `/login`         | Login              | Allows users to log in to their account                                 |
| `/signup`        | Sign Up            | Allows users to create a new account                                    |
| `/account`       | Account Settings   | Allows users to update profile, preferences, and manage saved data      |
| `/about` or `/docs` | App Documentation | Explains volatility methods, how VaR is calculated, and data policies    |
| `/404`           | Not Found          | Fallback page for unknown routes (auto-handled by Next.js)              |

---

## 🔁 Navigation Flow

| From Page        | Action / Link                  | Navigates To         |
|------------------|--------------------------------|-----------------------|
| `/`              | Click "Start Analyzing"        | `/analyze`            |
| `/`              | Click "Login" or "Sign Up"     | `/login` / `/signup`  |
| `/analyze`       | Submit analysis                | Show results on same page |
| `/analyze`       | Save portfolio (logged in)     | `/dashboard`          |
| `/dashboard`     | View or load saved analysis    | `/analyze` or result viewer |
| Any page (nav)   | Click on profile/settings      | `/account`            |
| Footer/nav       | Click "Docs" or "How It Works" | `/about` or `/docs`   |

---

## 🧩 Page-Level Components

| Page            | Components Used                                                   |
|-----------------|-------------------------------------------------------------------|
| `/`             | `<HeroHeader>`, `<CallToAction>`, `<Footer>`                     |
| `/analyze`      | `<TickerInputRow>`, `<DateRangePicker>`, `<ResultCard>`, `<VolatilitySelector>` |
| `/dashboard`    | `<SavedPortfolioCard>`, `<PortfolioList>`, `<ChartPreview>`      |
| `/login`/`signup` | Auth form components (via Clerk/Auth.js or custom)             |
| `/account`      | `<AccountDetailsForm>`, `<PreferencesCard>`                      |
| `/docs`         | `<DocsSection>`, `<FAQItem>`                                     |

---

## ✅ Planned Future Enhancements

| Feature           | Description                                                  |
|------------------|--------------------------------------------------------------|
| Volatility Methods | Add rolling, EWMA, GARCH, LSTM, and Transformers            |
| User Auth        | Clerk/Auth.js integration for login/signup                   |
| Report Export    | Allow users to download PDF/CSV reports                      |
| Saved Analyses   | Dashboard view with saved portfolios per user                |
| Theming          | Optional dark/light theme support                            |
| Changelog        | Feature drop announcements and version tracking              |

---