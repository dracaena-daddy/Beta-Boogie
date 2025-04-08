# test_db.py
from db import engine
from sqlalchemy import text

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT NOW()"))
        print("✅ Database connection successful.")
        print("⏰ Current time from DB:", result.scalar())
except Exception as e:
    print("❌ Database connection failed.")
    print(e)

