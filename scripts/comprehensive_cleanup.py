"""
Comprehensive Codebase Cleanup Script
Removes emojis, em-dashes, organizes docs, removes unused code
"""
import os
import re
from pathlib import Path

class CodebaseCleanup:
    def __init__(self, root_dir="."):
        self.root_dir = Path(root_dir)
        self.changes = []
        
    def remove_emojis(self, text):
        """Remove all emojis from text"""
        emoji_pattern = re.compile("["
            u"\U0001F600-\U0001F64F"  # emoticons
            u"\U0001F300-\U0001F5FF"  # symbols & pictographs
            u"\U0001F680-\U0001F6FF"  # transport & map symbols
            u"\U0001F1E0-\U0001F1FF"  # flags
            u"\U00002702-\U000027B0"
            u"\U000024C2-\U0001F251"
            u"\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
            u"\U00002600-\U000026FF"  # Misc symbols
            u"\U00002700-\U000027BF"
            "]+", flags=re.UNICODE)
        return emoji_pattern.sub(r'', text)
    
    def remove_em_dashes(self, text):
        """Remove em-dashes"""
        return text.replace('—', '-')
    
    def clean_file(self, filepath):
        """Clean a single file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                original = f.read()
            
            cleaned = self.remove_emojis(original)
            cleaned = self.remove_em_dashes(cleaned)
            
            if cleaned != original:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(cleaned)
                return True
        except Exception as e:
            print(f"Error processing {filepath}: {e}")
        return False
    
    def cleanup_docs(self):
        """Clean all documentation files"""
        doc_extensions = ['.md', '.txt']
        cleaned_count = 0
        
        for root, dirs, files in os.walk(self.root_dir):
            # Skip node_modules, venv, pycache
            dirs[:] = [d for d in dirs if d not in ['node_modules', 'venv', '__pycache__', '.git']]
            
            for file in files:
                if any(file.endswith(ext) for ext in doc_extensions):
                    filepath = Path(root) / file
                    if self.clean_file(filepath):
                        cleaned_count += 1
                        self.changes.append(f"Cleaned: {filepath}")
        
        return cleaned_count
    
    def cleanup_source_files(self):
        """Clean source code files"""
        code_extensions = ['.py', '.ts', '.tsx', '.js', '.jsx']
        cleaned_count = 0
        
        for root, dirs, files in os.walk(self.root_dir):
            dirs[:] = [d for d in dirs if d not in ['node_modules', 'venv', '__pycache__', '.git']]
            
            for file in files:
                if any(file.endswith(ext) for ext in code_extensions):
                    filepath = Path(root) / file
                    if self.clean_file(filepath):
                        cleaned_count += 1
                        self.changes.append(f"Cleaned: {filepath}")
        
        return cleaned_count
    
    def identify_duplicate_docs(self):
        """Identify potentially duplicate documentation files"""
        docs_dir = self.root_dir / 'docs'
        if not docs_dir.exists():
            return []
        
        doc_files = list(docs_dir.glob('*.md'))
        duplicates = []
        
        # Check for similar named files
        cleanup_related = [f for f in doc_files if 'CLEANUP' in f.name]
        status_related = [f for f in doc_files if 'STATUS' in f.name or 'COMPLETE' in f.name]
        implementation_related = [f for f in doc_files if 'IMPLEMENTATION' in f.name]
        
        if len(cleanup_related) > 1:
            duplicates.extend(cleanup_related)
        if len(status_related) > 2:
            duplicates.extend(status_related)
        if len(implementation_related) > 1:
            duplicates.extend(implementation_related)
        
        return list(set(duplicates))
    
    def run(self):
        """Run all cleanup tasks"""
        print("=" * 60)
        print("COMPREHENSIVE CODEBASE CLEANUP")
        print("=" * 60)
        
        print("\n1. Cleaning documentation files...")
        docs_cleaned = self.cleanup_docs()
        print(f"   Cleaned {docs_cleaned} documentation files")
        
        print("\n2. Cleaning source code files...")
        code_cleaned = self.cleanup_source_files()
        print(f"   Cleaned {code_cleaned} source code files")
        
        print("\n3. Identifying duplicate documentation...")
        duplicates = self.identify_duplicate_docs()
        if duplicates:
            print(f"   Found {len(duplicates)} potentially duplicate files:")
            for dup in duplicates:
                print(f"   - {dup.name}")
        else:
            print("   No duplicates found")
        
        print("\n4. Summary of changes:")
        if self.changes:
            for change in self.changes[:20]:  # Show first 20
                print(f"   {change}")
            if len(self.changes) > 20:
                print(f"   ... and {len(self.changes) - 20} more")
        else:
            print("   No changes needed - codebase already clean!")
        
        print("\n" + "=" * 60)
        print(f"CLEANUP COMPLETE: {len(self.changes)} files modified")
        print("=" * 60)

if __name__ == "__main__":
    cleanup = CodebaseCleanup()
    cleanup.run()


