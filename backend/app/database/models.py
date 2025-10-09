"""
SQLAlchemy ORM Models - Stock Soko Database Schema
Based on YAML architecture specification
"""
from sqlalchemy import Column, String, Boolean, Numeric, Integer, DateTime, Date, ForeignKey, Text, Index, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from . import Base


class User(Base):
    """Registered users"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, unique=True, nullable=True, index=True)
    full_name = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    salt = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="user")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    accounts = relationship("Account", back_populates="user")
    portfolio = relationship("Portfolio", back_populates="user", uselist=False)
    holdings = relationship("Holding", back_populates="user")
    orders = relationship("Order", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    alerts = relationship("Alert", back_populates="user")
    watchlists = relationship("Watchlist", back_populates="user")


class UserProfile(Base):
    """Extended profile and KYC status"""
    __tablename__ = "user_profiles"
    
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    dob = Column(Date, nullable=True)
    nationality = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    occupation = Column(String, nullable=True)
    kyc_status = Column(String, default="pending")
    kyc_provider_id = Column(String, nullable=True)
    kyc_data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="profile")


class Broker(Base):
    """Broker partners and connection metadata"""
    __tablename__ = "brokers"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    api_base_url = Column(String, nullable=True)
    connector_type = Column(String, nullable=True)
    sandbox_mode = Column(Boolean, default=True)
    credentials = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    accounts = relationship("Account", back_populates="broker")


class Account(Base):
    """User brokerage account / CDS mapping"""
    __tablename__ = "accounts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    broker_id = Column(String, ForeignKey("brokers.id"), nullable=False)
    broker_account_ref = Column(String, nullable=True)
    cds_number = Column(String, nullable=True)
    status = Column(String, default="onboarding")  # active, onboarding, suspended
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="accounts")
    broker = relationship("Broker", back_populates="accounts")
    orders = relationship("Order", back_populates="account")


class Portfolio(Base):
    """User's portfolio overview (computed or materialized)"""
    __tablename__ = "portfolios"
    
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    cash = Column(Numeric, default=0)
    buying_power = Column(Numeric, default=0)
    total_value = Column(Numeric, default=0)
    unrealized_pl = Column(Numeric, default=0)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="portfolio")


class Stock(Base):
    """Canonical list of companies / instruments"""
    __tablename__ = "stocks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    symbol = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    exchange = Column(String, default="NSE")
    sector = Column(String, nullable=True)
    currency = Column(String, default="KES")
    lot_size = Column(Integer, default=1)
    market_cap = Column(Numeric, nullable=True)
    latest_price = Column(Numeric, nullable=True)
    previous_close = Column(Numeric, nullable=True)
    pe_ratio = Column(Numeric, nullable=True)
    dividend_yield = Column(Numeric, nullable=True)
    extra_data = Column(JSON, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    holdings = relationship("Holding", back_populates="stock")
    orders = relationship("Order", back_populates="stock")
    market_ticks = relationship("MarketTick", back_populates="stock")
    news = relationship("News", back_populates="stock")
    alerts = relationship("Alert", back_populates="stock")
    watchlists = relationship("Watchlist", back_populates="stock")


class Holding(Base):
    """Per-user holdings, per stock"""
    __tablename__ = "holdings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    stock_id = Column(String, ForeignKey("stocks.id"), nullable=False, index=True)
    quantity = Column(Numeric, nullable=False)
    avg_price = Column(Numeric, nullable=False)
    market_value = Column(Numeric, nullable=True)
    realized_pl = Column(Numeric, default=0)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="holdings")
    stock = relationship("Stock", back_populates="holdings")
    
    # Composite index
    __table_args__ = (
        Index('ix_holdings_user_stock', 'user_id', 'stock_id'),
    )


class Order(Base):
    """Order placement & lifecycle"""
    __tablename__ = "orders"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    broker_order_id = Column(String, nullable=True)
    stock_id = Column(String, ForeignKey("stocks.id"), nullable=False, index=True)
    side = Column(String, nullable=False)  # buy/sell
    order_type = Column(String, nullable=False)  # market/limit/stop
    quantity = Column(Numeric, nullable=False)
    price = Column(Numeric, nullable=True)  # limit price
    status = Column(String, default="pending", index=True)  # pending, executed, failed, cancelled
    filled_quantity = Column(Numeric, default=0)
    fees = Column(Numeric, default=0)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="orders")
    account = relationship("Account", back_populates="orders")
    stock = relationship("Stock", back_populates="orders")
    
    # Composite indexes
    __table_args__ = (
        Index('ix_orders_user_status', 'user_id', 'status'),
    )


class Transaction(Base):
    """Funding / withdrawals / STK push records"""
    __tablename__ = "transactions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String, nullable=False)  # deposit, withdrawal
    method = Column(String, nullable=False)  # mpesa, bank
    amount = Column(Numeric, nullable=False)
    status = Column(String, default="pending", index=True)  # pending, completed, failed
    provider_reference = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="transactions")
    
    # Composite index
    __table_args__ = (
        Index('ix_transactions_user_status', 'user_id', 'status'),
    )


class MarketTick(Base):
    """High-frequency tick / OHLCV (TimescaleDB hypertable recommended)"""
    __tablename__ = "market_ticks"
    
    time = Column(DateTime(timezone=True), primary_key=True)
    stock_id = Column(String, ForeignKey("stocks.id"), primary_key=True, index=True)
    price = Column(Numeric, nullable=False)
    volume = Column(Numeric, nullable=True)
    bid = Column(Numeric, nullable=True)
    ask = Column(Numeric, nullable=True)
    extra_data = Column(JSON, nullable=True)
    
    # Relationships
    stock = relationship("Stock", back_populates="market_ticks")


class News(Base):
    """Aggregated news & sentiment"""
    __tablename__ = "news"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    stock_id = Column(String, ForeignKey("stocks.id"), nullable=True, index=True)
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=True)
    source = Column(String, nullable=True)
    url = Column(String, nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=False, index=True)
    sentiment_score = Column(Numeric, nullable=True)
    extra_data = Column(JSON, nullable=True)
    
    # Relationships
    stock = relationship("Stock", back_populates="news")
    
    # Composite index
    __table_args__ = (
        Index('ix_news_stock_published', 'stock_id', 'published_at'),
    )


class Alert(Base):
    """User price/volume alerts"""
    __tablename__ = "alerts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    stock_id = Column(String, ForeignKey("stocks.id"), nullable=False, index=True)
    type = Column(String, nullable=False)  # price_above, price_below, pct_change
    value = Column(Numeric, nullable=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="alerts")
    stock = relationship("Stock", back_populates="alerts")


class Watchlist(Base):
    """User watchlist entries"""
    __tablename__ = "watchlists"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    stock_id = Column(String, ForeignKey("stocks.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="watchlists")
    stock = relationship("Stock", back_populates="watchlists")
    
    # Unique constraint
    __table_args__ = (
        Index('ix_watchlist_user_stock', 'user_id', 'stock_id', unique=True),
    )