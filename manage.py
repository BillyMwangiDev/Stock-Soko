#!/usr/bin/env python
"""
Stock Soko - Database Management Script
"""
import sys
import argparse
sys.path.insert(0, 'backend')

from app.database import init_db

def main():
    parser = argparse.ArgumentParser(description='Stock Soko Database Management')
    parser.add_argument('command', choices=['init-db'], help='Command to execute')
    
    args = parser.parse_args()
    
    if args.command == 'init-db':
        print("Initializing database...")
        init_db()
        print("Database initialized successfully!")
        return 0
    
    return 1

if __name__ == '__main__':
    sys.exit(main())

