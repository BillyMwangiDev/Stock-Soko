"""
Database Migration: Add Broker Account Balances

This migration adds balance tracking fields to the Account model
and links transactions to specific broker accounts.

Changes:
- Add balance, reserved_balance, total_deposits, total_withdrawals to accounts table
- Add is_active and is_primary flags to accounts table
- Add updated_at timestamp to accounts table
- Add account_id foreign key to transactions table

Run with: python backend/migrations/add_broker_account_balances.py
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    create_engine,
)
from sqlalchemy.sql import func

from backend.app.config import DATABASE_URL
from backend.app.utils.logging import get_logger

logger = get_logger("migration")


def run_migration():
    """
    Run the migration to add broker account balance fields
    """
    engine = create_engine(DATABASE_URL)

    with engine.begin() as conn:
        logger.info("Starting migration: add_broker_account_balances")

        try:
            # Check if migrations have already been applied
            # Try to query for the new columns
            result = conn.execute("PRAGMA table_info(accounts)")
            columns = [row[1] for row in result]

            if "balance" in columns:
                logger.info("Migration already applied. Skipping.")
                return

            # Add new columns to accounts table
            logger.info("Adding balance tracking columns to accounts table...")

            conn.execute("""
                ALTER TABLE accounts 
                ADD COLUMN balance NUMERIC DEFAULT 0
            """)
            logger.info("  - Added balance column")

            conn.execute("""
                ALTER TABLE accounts 
                ADD COLUMN reserved_balance NUMERIC DEFAULT 0
            """)
            logger.info("  - Added reserved_balance column")

            conn.execute("""
                ALTER TABLE accounts 
                ADD COLUMN total_deposits NUMERIC DEFAULT 0
            """)
            logger.info("  - Added total_deposits column")

            conn.execute("""
                ALTER TABLE accounts 
                ADD COLUMN total_withdrawals NUMERIC DEFAULT 0
            """)
            logger.info("  - Added total_withdrawals column")

            conn.execute("""
                ALTER TABLE accounts 
                ADD COLUMN is_active BOOLEAN DEFAULT 1
            """)
            logger.info("  - Added is_active column")

            conn.execute("""
                ALTER TABLE accounts 
                ADD COLUMN is_primary BOOLEAN DEFAULT 0
            """)
            logger.info("  - Added is_primary column")

            conn.execute("""
                ALTER TABLE accounts 
                ADD COLUMN updated_at TIMESTAMP
            """)
            logger.info("  - Added updated_at column")

            # Add account_id to transactions table
            logger.info("Adding account_id foreign key to transactions table...")

            conn.execute("""
                ALTER TABLE transactions 
                ADD COLUMN account_id VARCHAR
            """)
            logger.info("  - Added account_id column")

            # Create index on account_id
            try:
                conn.execute("""
                    CREATE INDEX ix_transactions_account_id 
                    ON transactions(account_id)
                """)
                logger.info("  - Created index on account_id")
            except Exception as e:
                logger.warning(f"  - Index may already exist: {e}")

            # Set first account as primary for each user
            logger.info("Setting primary accounts for existing users...")
            conn.execute("""
                UPDATE accounts 
                SET is_primary = 1 
                WHERE id IN (
                    SELECT MIN(id) 
                    FROM accounts 
                    GROUP BY user_id
                )
            """)
            logger.info("  - Set primary accounts")

            logger.info("Migration completed successfully!")

        except Exception as e:
            logger.error(f"Migration failed: {e}")
            raise


def rollback_migration():
    """
    Rollback the migration (for testing purposes)

    WARNING: This will remove data! Use only in development.
    """
    engine = create_engine(DATABASE_URL)

    with engine.begin() as conn:
        logger.info("Rolling back migration: add_broker_account_balances")

        try:
            # SQLite doesn't support DROP COLUMN, so this is mainly for documentation
            # In production, you would need to recreate the tables

            logger.warning("SQLite doesn't support DROP COLUMN.")
            logger.warning("To rollback, you need to:")
            logger.warning("1. Export data")
            logger.warning("2. Drop and recreate tables")
            logger.warning("3. Import data back")

            # For PostgreSQL, you would do:
            # conn.execute("ALTER TABLE accounts DROP COLUMN balance")
            # conn.execute("ALTER TABLE accounts DROP COLUMN reserved_balance")
            # ... etc

        except Exception as e:
            logger.error(f"Rollback failed: {e}")
            raise


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Database migration for broker account balances"
    )
    parser.add_argument(
        "--rollback",
        action="store_true",
        help="Rollback the migration (WARNING: May lose data!)",
    )

    args = parser.parse_args()

    if args.rollback:
        confirm = input(
            "Are you sure you want to rollback? This may cause data loss. (yes/no): "
        )
        if confirm.lower() == "yes":
            rollback_migration()
        else:
            print("Rollback cancelled.")
    else:
        run_migration()
