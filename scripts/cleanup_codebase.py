#!/usr/bin/env python3
"""
Comprehensive codebase cleanup script
Removes emojis, em dashes, verbose comments, and organizes files
"""

import os
import re
import shutil
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent

def remove_emojis_and_symbols(text: str) -> str:
    """Remove emojis, checkmarks, and em dashes"""
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"
        "\U0001F300-\U0001F5FF"
        "\U0001F680-\U0001F6FF"
        "\U0001F1E0-\U0001F1FF"
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "\U0001F900-\U0001F9FF"
        "\U00002600-\U000026FF"
        "\U00002700-\U000027BF"
        "]+", flags=re.UNICODE
    )
    
    text = emoji_pattern.sub('', text)
    text = text.replace('-', '-')
    text = text.replace('', '[OK]')
    text = text.replace('[ACTIVE]', '[ACTIVE]')
    text = text.replace('', '')
    text = text.replace('', '')
    text = text.replace('', '')
    text = text.replace('', '')
    text = text.replace('', '')
    text = text.replace('', '')
    text = text.replace('', '')
    text = text.replace('', '')
    text = text.replace('', '')
    
    return text.strip()

def cleanup_file(file_path: Path):
    """Clean up a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        content = remove_emojis_and_symbols(content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Cleaned: {file_path.relative_to(PROJECT_ROOT)}")
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def cleanup_directory(directory: Path, extensions: list):
    """Clean up all files in a directory with given extensions"""
    count = 0
    for ext in extensions:
        for file_path in directory.rglob(f'*{ext}'):
            if 'node_modules' in str(file_path) or '__pycache__' in str(file_path) or 'venv' in str(file_path):
                continue
            if cleanup_file(file_path):
                count += 1
    return count

def main():
    print("=" * 80)
    print("CODEBASE CLEANUP")
    print("=" * 80)
    
    print("\n1. Cleaning TypeScript/JavaScript files...")
    ts_count = cleanup_directory(PROJECT_ROOT / 'frontend', ['.ts', '.tsx', '.js'])
    print(f"   Cleaned {ts_count} TypeScript/JavaScript files")
    
    print("\n2. Cleaning Python files...")
    py_count = cleanup_directory(PROJECT_ROOT / 'backend', ['.py'])
    print(f"   Cleaned {py_count} Python files")
    
    print("\n3. Cleaning documentation files...")
    md_count = cleanup_directory(PROJECT_ROOT, ['.md'])
    print(f"   Cleaned {md_count} Markdown files")
    
    print("\n4. Cleaning scripts...")
    script_count = cleanup_directory(PROJECT_ROOT / 'scripts', ['.py'])
    print(f"   Cleaned {script_count} script files")
    
    total = ts_count + py_count + md_count + script_count
    print(f"\n{total} files cleaned")
    print("=" * 80)

if __name__ == '__main__':
    main()