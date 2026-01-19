# Git History Cleanup Guide

## Overview

This guide explains how to remove sensitive data from Git history after a credential leak has been detected.

## Important Warning

**CRITICAL**: Rewriting Git history will change all commit hashes from the point of the leak forward. This requires coordination with all team members.

**Before proceeding:**
1. Notify all team members
2. Ensure all work is committed and pushed
3. Create a backup of the repository
4. Schedule a maintenance window
5. Coordinate the cleanup

## Option 1: BFG Repo-Cleaner (Recommended)

BFG is faster and easier than git filter-branch.

### Installation

```bash
# Download BFG
# Windows: Download from https://rtyley.github.io/bfg-repo-cleaner/
# macOS: brew install bfg
# Linux: wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
```

### Steps

1. **Create password replacement file**

```bash
# Create passwords.txt with patterns to replace
cat > passwords.txt << EOF
***REMOVED***=actual_exposed_password
regex:password\s*=\s*["\'][^"\']{8,}["\']
regex:(***REMOVED***
EOF
```

2. **Clone a fresh copy**

```bash
# Clone with full history
git clone --mirror https://github.com/your-org/Stock-Soko.git
cd Stock-Soko.git
```

3. **Run BFG**

```bash
# Replace passwords
java -jar bfg.jar --replace-text passwords.txt

# Or delete specific files
java -jar bfg.jar --delete-files .env
```

4. **Clean up repository**

```bash
# Expire reflog
git reflog expire --expire=now --all

# Garbage collect
git gc --prune=now --aggressive
```

5. **Force push**

```bash
# Force push cleaned history
git push --force

# Notify all team members to re-clone
```

## Option 2: Git Filter-Branch

More manual but built into Git.

### Steps

1. **Remove specific file from history**

```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

2. **Replace text patterns**

```bash
git filter-branch --force --tree-filter \
  "find . -type f -name '*.py' -exec sed -i 's/***REMOVED***=.*/***REMOVED***=REDACTED/g' {} \;" \
  --prune-empty --tag-name-filter cat -- --all
```

3. **Clean up**

```bash
# Remove backup refs
rm -rf .git/refs/original/

# Expire reflog
git reflog expire --expire=now --all

# Garbage collect
git gc --prune=now --aggressive
```

4. **Force push**

```bash
git push origin --force --all
git push origin --force --tags
```

## Option 3: GitHub Secret Scanning Auto-Remediation

If you're using GitHub and the secret is still active:

1. Go to repository Settings → Security → Secret scanning alerts
2. Review the detected secret
3. Click "Close alert" only after:
   - Secret has been revoked
   - New secret has been generated
   - Git history has been cleaned

## Post-Cleanup Steps

### 1. Verify Cleanup

```bash
# Search for the exposed secret
git log --all --full-history -S "***REMOVED***" --source

# Check for any remaining references
git grep -i "smtp_password"

# Verify history size reduced
git count-objects -vH
```

### 2. Team Coordination

Send this message to all team members:

```
URGENT: Git History Rewrite

We've cleaned sensitive data from our Git repository. Please follow these steps:

1. Save any uncommitted work
2. Delete your local repository
3. Re-clone from GitHub:
   git clone https://github.com/your-org/Stock-Soko.git
4. DO NOT push any old commits
5. If you have issues, contact the team lead

The commit hashes have changed. Old branches may cause conflicts.
```

### 3. Update All Secrets

Even after cleaning history, assume secrets were compromised:

```bash
# Generate new secrets
python scripts/rotate_secrets.py

# Update production environment
# (Follow your deployment procedure)

# Revoke old secrets at their source
# - Email provider: Change password
# - AWS: Rotate access keys
# - API providers: Generate new keys
```

### 4. Prevent Future Leaks

```bash
# Install pre-commit hooks
pip install pre-commit
pre-commit install

# Run initial scan
pre-commit run --all-files

# Configure secret detection
detect-secrets scan --baseline .secrets.baseline
```

### 5. Update Documentation

```bash
# Update .env.example
# Ensure it has no real values

# Update README.md
# Add security warnings

# Document incident
# Add to security log
```

## Verification Checklist

After cleanup, verify:

- [ ] Secret no longer appears in Git history
- [ ] All team members have re-cloned
- [ ] New secrets generated and deployed
- [ ] Old secrets revoked at source
- [ ] No unauthorized access occurred
- [ ] Monitoring is in place
- [ ] Pre-commit hooks installed
- [ ] Documentation updated
- [ ] Incident documented
- [ ] Team trained on prevention

## Alternative: Start Fresh Repository

If cleanup is too complex or risky:

### Option A: Squash History

```bash
# Create new branch from current state
git checkout --orphan fresh-start

# Add all files
git add -A

# Create initial commit
git commit -m "Initial commit (cleaned history)"

# Force push to main
git branch -D main
git branch -m main
git push origin main --force
```

### Option B: Archive and Start New

```bash
# Archive old repository
mv Stock-Soko Stock-Soko-archived

# Create new repository
git init Stock-Soko
cd Stock-Soko

# Copy code (excluding .git)
cp -r ../Stock-Soko-archived/* .
rm -rf .git

# Initialize new repo
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-org/Stock-Soko.git
git push -u origin main --force
```

## Prevention Tools

### 1. Git Hooks

```bash
# .git/hooks/pre-commit
#!/bin/bash
gitleaks protect --staged --verbose
if [ $? -ne 0 ]; then
    echo "❌ Secrets detected! Commit rejected."
    exit 1
fi
```

### 2. GitHub Actions

Add to `.github/workflows/security-scan.yml`:

```yaml
- name: Gitleaks Secret Scan
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 3. GitGuardian

Configure automated monitoring:
- https://dashboard.gitguardian.com/
- Enable real-time alerts
- Set up incident webhooks

## Recovery Time Estimates

| Method | Time Required | Difficulty | Risk Level |
|--------|--------------|------------|------------|
| BFG Repo-Cleaner | 30 minutes | Easy | Low |
| Git Filter-Branch | 1-2 hours | Medium | Medium |
| Squash History | 15 minutes | Easy | Low |
| Fresh Repository | 10 minutes | Easy | None |

## Support

If you need help:
- Email: security@stocksoko.com
- Internal: #security-incidents Slack channel
- Escalation: CTO / Security Lead

## References

- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [GitHub: Removing Sensitive Data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Git Filter-Branch](https://git-scm.com/docs/git-filter-branch)
- [GitGuardian](https://www.gitguardian.com/)

---

**Last Updated**: 2026-01-19
