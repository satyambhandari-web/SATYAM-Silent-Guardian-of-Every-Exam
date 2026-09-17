from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Defaulting to SQLite for hackathon prototype
SQLALCHEMY_DATABASE_URL = "sqlite:///./satyam_prototype.db"

# connect_args={"check_same_thread": False} is needed only for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
