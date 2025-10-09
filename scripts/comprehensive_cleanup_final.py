#!/usr/bin/env python3
"""
Final comprehensive cleanup: Remove verbose comments, unused imports, fix consistency
"""

import os
import re
import ast
from pathlib import Path
from typing import List, Set

PROJECT_ROOT = Path(__file__).parent.parent

# Patterns for verbose/useless comments
USELESS_COMMENT_PATTERNS = [
    r'#\s*TODO:?\s*implement.*',
    r'#\s*FIXME:?\s*.*',
    r'#\s*NOTE:?\s*obvious.*',
    r'//\s*TODO:?\s*implement.*',
    r'//\s*FIXME:?\s*.*',
    r'/\*\*\s*\*\s*\*/',  # Empty JSDoc
]

def remove_useless_comments_py(content: str) -> str:
    """Remove useless Python comments"""
    lines = content.split('\n')
    cleaned_lines = []
    
    for line in lines:
        stripped = line.strip()
        
        # Skip lines that are just separators
        if re.match(r'^#\s*[-=]{10,}', stripped):
            continue
            
        # Skip obvious comments like "# Import libraries"
        if re.match(r'^#\s*(Import|Imports|Dependencies|Setup|Initialize|Main code)', stripped, re.IGNORECASE):
            continue
            
        cleaned_lines.append(line)
    
    return '\n'.join(cleaned_lines)

def remove_useless_comments_ts(content: str) -> str:
    """Remove useless TypeScript/JavaScript comments"""
    lines = content.split('\n')
    cleaned_lines = []
    
    for line in lines:
        stripped = line.strip()
        
        # Skip lines that are just separators
        if re.match(r'^//\s*[-=]{10,}', stripped):
            continue
            
        # Skip obvious comments
        if re.match(r'^//\s*(Import|Imports|Dependencies|Setup|Initialize|Main|Components?|Hooks?|Utils?|Types?)', stripped, re.IGNORECASE):
            continue
            
        cleaned_lines.append(line)
    
    return '\n'.join(cleaned_lines)

def clean_file(file_path: Path):
    """Clean a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        if file_path.suffix == '.py':
            content = remove_useless_comments_py(content)
        elif file_path.suffix in ['.ts', '.tsx', '.js', '.jsx']:
            content = remove_useless_comments_ts(content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    print("=" * 80)
    print("FINAL CLEANUP - Removing verbose comments")
    print("=" * 80)
    
    count = 0
    
    # Clean Python files
    for file_path in (PROJECT_ROOT / 'backend').rglob('*.py'):
        if '__pycache__' in str(file_path) or 'venv' in str(file_path):
            continue
        if clean_file(file_path):
            count += 1
            print(f"Cleaned: {file_path.relative_to(PROJECT_ROOT)}")
    
    # Clean TypeScript files
    for ext in ['.ts', '.tsx', '.js']:
        for file_path in (PROJECT_ROOT / 'frontend').rglob(f'*{ext}'):
            if 'node_modules' in str(file_path):
                continue
            if clean_file(file_path):
                count += 1
                print(f"Cleaned: {file_path.relative_to(PROJECT_ROOT)}")
    
    print(f"\n{count} files cleaned")
    print("=" * 80)

if __name__ == '__main__':
    main()

