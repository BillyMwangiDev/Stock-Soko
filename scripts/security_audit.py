"""
Security Audit Script
Performs basic security checks on Stock Soko codebase
"""
import os
import re
import sys
from pathlib import Path
from typing import List, Tuple


class SecurityAuditor:
    """Run security checks on codebase"""
    
    def __init__(self, root_dir: str = "."):
        self.root = Path(root_dir)
        self.issues: List[Tuple[str, str, str]] = []
        
        # Patterns to detect potential security issues
        self.secret_patterns = [
            (r'password\s*=\s*["\'][^"\']{8,}["\']', "Potential hardcoded password"),
            (r'secret\s*=\s*["\'][^"\']{20,}["\']', "Potential hardcoded secret"),
            (r'api[_-]?key\s*=\s*["\'][^"\']{20,}["\']', "Potential hardcoded API key"),
            (r'token\s*=\s*["\'][^"\']{20,}["\']', "Potential hardcoded token"),
            (r'(AKIA|ASIA)[0-9A-Z]{16}', "Potential AWS access key"),
            (r'[0-9a-f]{32}', "Potential MD5 hash or API key"),
        ]
        
        self.exclude_dirs = {
            'venv', '.venv', 'env', 'node_modules', '__pycache__',
            '.git', '.pytest_cache', 'dist', 'build', '.egg-info'
        }
        
        self.exclude_files = {
            '.pyc', '.pyo', '.so', '.db', '.sqlite', '.sqlite3'
        }
    
    def check_env_files(self) -> None:
        """Check for .env files in repository"""
        print("Checking for .env files...")
        
        env_files = list(self.root.rglob(".env"))
        env_files = [
            f for f in env_files
            if not any(ex in f.parts for ex in self.exclude_dirs)
        ]
        
        if env_files:
            for env_file in env_files:
                self.issues.append((
                    "CRITICAL",
                    str(env_file.relative_to(self.root)),
                    ".env file found in repository"
                ))
        
        # Check if .env.example exists
        if not (self.root / ".env.example").exists():
            self.issues.append((
                "WARNING",
                ".env.example",
                ".env.example file missing"
            ))
    
    def check_gitignore(self) -> None:
        """Verify .gitignore includes sensitive files"""
        print("Checking .gitignore...")
        
        gitignore_path = self.root / ".gitignore"
        if not gitignore_path.exists():
            self.issues.append((
                "CRITICAL",
                ".gitignore",
                ".gitignore file missing"
            ))
            return
        
        with open(gitignore_path) as f:
            content = f.read()
        
        required_patterns = [".env", "*.db", "*.sqlite", "*.log"]
        for pattern in required_patterns:
            if pattern not in content:
                self.issues.append((
                    "WARNING",
                    ".gitignore",
                    f"Missing pattern: {pattern}"
                ))
    
    def check_hardcoded_secrets(self) -> None:
        """Scan for hardcoded secrets in Python files"""
        print("Scanning for hardcoded secrets...")
        
        python_files = list(self.root.rglob("*.py"))
        python_files = [
            f for f in python_files
            if not any(ex in f.parts for ex in self.exclude_dirs)
            and f.suffix not in self.exclude_files
        ]
        
        for py_file in python_files:
            try:
                with open(py_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                for pattern, description in self.secret_patterns:
                    matches = re.finditer(pattern, content, re.IGNORECASE)
                    for match in matches:
                        # Skip common false positives
                        matched_text = match.group(0)
                        if any(fp in matched_text.lower() for fp in [
                            'test', 'example', 'demo', 'default', 'placeholder'
                        ]):
                            continue
                        
                        self.issues.append((
                            "HIGH",
                            str(py_file.relative_to(self.root)),
                            f"{description}: {matched_text[:50]}..."
                        ))
            
            except Exception as e:
                print(f"Error reading {py_file}: {e}")
    
    def check_debug_mode(self) -> None:
        """Check if DEBUG is enabled in config"""
        print("Checking debug mode...")
        
        config_file = self.root / "backend" / "app" / "config.py"
        if config_file.exists():
            with open(config_file) as f:
                content = f.read()
            
            if 'DEBUG: bool = True' in content:
                self.issues.append((
                    "HIGH",
                    "backend/app/config.py",
                    "DEBUG hardcoded to True"
                ))
    
    def check_security_headers(self) -> None:
        """Verify security headers middleware exists"""
        print("Checking security headers...")
        
        security_headers_file = self.root / "backend" / "app" / "utils" / "security_headers.py"
        if not security_headers_file.exists():
            self.issues.append((
                "WARNING",
                "Security middleware",
                "Security headers middleware missing"
            ))
    
    def check_rate_limiting(self) -> None:
        """Verify rate limiting is configured"""
        print("Checking rate limiting...")
        
        main_file = self.root / "backend" / "app" / "main.py"
        if main_file.exists():
            with open(main_file) as f:
                content = f.read()
            
            if "RateLimitMiddleware" not in content:
                self.issues.append((
                    "HIGH",
                    "backend/app/main.py",
                    "Rate limiting middleware not configured"
                ))
    
    def check_dependencies(self) -> None:
        """Check for security scanning dependencies"""
        print("Checking security dependencies...")
        
        requirements_file = self.root / "requirements.txt"
        if requirements_file.exists():
            with open(requirements_file) as f:
                content = f.read()
            
            security_tools = ["pip-audit", "safety", "bandit"]
            for tool in security_tools:
                if tool not in content:
                    self.issues.append((
                        "INFO",
                        "requirements.txt",
                        f"Consider adding {tool} for security scanning"
                    ))
    
    def run_audit(self) -> int:
        """Run all security checks"""
        print("=" * 60)
        print("Stock Soko Security Audit")
        print("=" * 60)
        print()
        
        self.check_env_files()
        self.check_gitignore()
        self.check_hardcoded_secrets()
        self.check_debug_mode()
        self.check_security_headers()
        self.check_rate_limiting()
        self.check_dependencies()
        
        print()
        print("=" * 60)
        print("Audit Results")
        print("=" * 60)
        print()
        
        if not self.issues:
            print("[+] No security issues found!")
            return 0
        
        # Group by severity
        critical = [i for i in self.issues if i[0] == "CRITICAL"]
        high = [i for i in self.issues if i[0] == "HIGH"]
        warning = [i for i in self.issues if i[0] == "WARNING"]
        info = [i for i in self.issues if i[0] == "INFO"]
        
        if critical:
            print("CRITICAL ISSUES:")
            for severity, location, description in critical:
                print(f"  [!] {location}: {description}")
            print()
        
        if high:
            print("HIGH PRIORITY:")
            for severity, location, description in high:
                print(f"  [!!] {location}: {description}")
            print()
        
        if warning:
            print("WARNINGS:")
            for severity, location, description in warning:
                print(f"  [*] {location}: {description}")
            print()
        
        if info:
            print("INFO:")
            for severity, location, description in info:
                print(f"  [i] {location}: {description}")
            print()
        
        print(f"Total issues: {len(self.issues)}")
        print(f"  Critical: {len(critical)}")
        print(f"  High: {len(high)}")
        print(f"  Warning: {len(warning)}")
        print(f"  Info: {len(info)}")
        print()
        
        if critical or high:
            print("[!] Action required: Please address critical and high priority issues!")
            return 1
        
        return 0


def main():
    """Run security audit"""
    auditor = SecurityAuditor()
    exit_code = auditor.run_audit()
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
