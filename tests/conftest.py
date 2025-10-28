import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.main import app
from backend.app.database import Base


@pytest.fixture(scope="module")
def client():
	return TestClient(app)


@pytest.fixture(scope="function")
def db_session():
	"""Create a fresh database session for each test"""
	# Use in-memory SQLite for tests
	engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
	
	# Create all tables
	Base.metadata.create_all(bind=engine)
	
	# Create session
	SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
	session = SessionLocal()
	
	try:
		yield session
	finally:
		session.close()
		Base.metadata.drop_all(bind=engine)
