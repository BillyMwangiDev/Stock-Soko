"""
Code Cleanup Script
Removes verbose comments, emojis, and cleans up codebase
"""
import re
import os
from pathlib import Path

def clean_file(filepath):
    """Clean a single file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Remove verbose JSX comments
    verbose_patterns = [
        r'\s*\{/\* Header \*/\}\n',
        r'\s*\{/\* Footer \*/\}\n',
        r'\s*\{/\* Section \*/\}\n',
        r'\s*\{/\* Button \*/\}\n',
        r'\s*\{/\* Card \*/\}\n',
        r'\s*\{/\* Input \*/\}\n',
        r'\s*\{/\* Row \*/\}\n',
        r'\s*\{/\* Column \*/\}\n',
        r'\s*\{/\* Container \*/\}\n',
        r'\s*\{/\* Content \*/\}\n',
        r'\s*\{/\* Actions \*/\}\n',
        r'\s*\{/\* Empty \*/\}\n',
        r'\s*\{/\* Loading \*/\}\n',
    ]
    
    for pattern in verbose_patterns:
        content = re.sub(pattern, '', content)
    
    # Remove specific verbose inline comments
    content = re.sub(r'\{/\* (Left|Right|Top|Bottom|Main|Primary|Secondary) \*/\}', '', content)
    content = re.sub(r'\{/\* (.*) (Section|Header|Footer|Card|Button|Input|Container) \*/\}', r'', content)
    
    # Remove emojis in text strings (but keep Ionicons)
    emoji_pattern = r'[📊📈📉💰🎯✅🚀🔔💬📱🤖💵🏆🎉✨💡📝🔥👋▶▼▲←→✓◆◇]'
    content = re.sub(emoji_pattern, '', content)
    
    # Clean up multiple blank lines
    content = re.sub(r'\n\n\n+', '\n\n', content)
    
    # Remove emdashes
    content = content.replace('—', '-')
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Run cleanup on all frontend files"""
    frontend_dir = Path(__file__).parent.parent / 'frontend' / 'src'
    
    files_cleaned = 0
    for filepath in frontend_dir.rglob('*.tsx'):
        if clean_file(filepath):
            files_cleaned += 1
            print(f"Cleaned: {filepath.name}")
    
    for filepath in frontend_dir.rglob('*.ts'):
        if clean_file(filepath):
            files_cleaned += 1
            print(f"Cleaned: {filepath.name}")
    
    print(f"\nCleaned {files_cleaned} files total")

if __name__ == '__main__':
    main()

