# Security Policy

## Table of Contents

- [Reporting a Vulnerability](#reporting-a-vulnerability)
- [Security Best Practices](#security-best-practices)
- [Secrets Management](#secrets-management)
- [Rate Limiting](#rate-limiting)
- [Authentication & Authorization](#authentication--authorization)
- [Data Protection](#data-protection)
- [Security Monitoring](#security-monitoring)
- [Incident Response](#incident-response)

## Reporting a Vulnerability

If you discover a security vulnerability in Stock Soko, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. Email security details to: security@stocksoko.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

We will respond within 48 hours and provide updates every 72 hours until resolved.

## Security Best Practices

### Environment Configuration

1. **Never commit sensitive data**
   - All secrets must be in `.env` file (gitignored)
   - Use `.env.example` as template (no real values)
   - Rotate secrets regularly (every 90 days minimum)

2. **Generate secure secrets**
   ```bash
   # Generate secure JWT secret
   python -c "import secrets; print(secrets.token_urlsafe(64))"
   
   # Generate secure database password
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

3. **Production requirements**
   - `ENVIRONMENT=production`
   - `DEBUG=false`
   - Strong `JWT_SECRET` (64+ characters)
   - PostgreSQL database (not SQLite)
   - HTTPS enabled
   - Secure CORS origins

### Code Security

1. **Input Validation**
   - All user inputs validated with Pydantic schemas
   - SQL injection prevented via ORM parameter binding
   - File uploads restricted by type and size
   - Email validation with regex patterns

2. **Authentication Security**
   - Passwords hashed with bcrypt (cost factor 12)
   - JWT tokens with expiration (60 minutes default)
   - 2FA support with TOTP
   - Rate limiting on auth endpoints (10 attempts/minute)

3. **API Security**
   - Rate limiting per IP and endpoint
   - Security headers (CSP, HSTS, X-Frame-Options)
   - CORS restricted to allowed origins
   - Request size limits enforced

## Secrets Management

### What to Protect

Critical secrets that must NEVER be committed:

- `JWT_SECRET` - Token signing key
- `SMTP_PASSWORD` - Email service password
- `DATABASE_URL` - Database credentials (production)
- `MPESA_CONSUMER_SECRET` - M-Pesa API secret
- `AWS_SECRET_ACCESS_KEY` - AWS credentials
- `FIREBASE_CREDENTIALS_PATH` - Firebase service account
- API keys for third-party services

### Storage Guidelines

1. **Development Environment**
   ```bash
   # Copy template
   cp .env.example .env
   
   # Edit with actual values
   # .env is gitignored automatically
   ```

2. **Production Environment**
   - Use environment variables from hosting platform
   - Use secrets management service (AWS Secrets Manager, Azure Key Vault)
   - Encrypt secrets at rest
   - Limit access via IAM policies

3. **CI/CD Pipelines**
   - Store secrets in GitHub Secrets
   - Never log secret values
   - Mask secrets in pipeline output
   - Rotate secrets after any exposure

### Secret Rotation Process

When rotating secrets:

1. Generate new secret value
2. Update production environment
3. Deploy application with new secret
4. Verify functionality
5. Revoke old secret
6. Document rotation in security log

## Rate Limiting

### Implementation

The application implements multi-layered rate limiting:

1. **Global Rate Limit**
   - Default: 100 requests per minute per IP
   - Configurable via `RATE_LIMIT_PER_MINUTE`

2. **Endpoint-Specific Limits**
   - `/api/v1/auth/login` - 10 per minute (brute force protection)
   - `/api/v1/auth/register` - 5 per minute (spam prevention)
   - `/api/v1/auth/reset-password` - 3 per minute (abuse prevention)
   - `/api/v1/payments/` - 20 per minute (fraud prevention)
   - `/api/v1/trades` - 30 per minute (trading abuse prevention)

3. **Response Headers**
   ```
   X-RateLimit-Limit: 100
   X-RateLimit-Remaining: 87
   X-RateLimit-Reset: 1704067200
   Retry-After: 45
   ```

### Monitoring Rate Limits

Check rate limit status:

```bash
# View metrics
curl http://localhost:8000/metrics | grep http_requests_total

# Check specific endpoint
curl -I http://localhost:8000/api/v1/auth/login
```

## Authentication & Authorization

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character
- Maximum 72 characters (bcrypt limit)

### JWT Token Security

1. **Token Structure**
   - Algorithm: HS256
   - Expiration: 60 minutes (configurable)
   - Payload: user_id, email, exp, iat

2. **Token Validation**
   - Signature verification
   - Expiration check
   - Issuer validation
   - Token revocation support

3. **Refresh Strategy**
   - Use refresh tokens for long-lived sessions
   - Rotate tokens on refresh
   - Invalidate on logout

### Two-Factor Authentication (2FA)

1. **TOTP Implementation**
   - Compatible with Google Authenticator, Authy
   - 6-digit codes
   - 30-second validity window
   - Backup codes for recovery

2. **Enforcement**
   - Optional for standard users
   - Recommended for admin accounts
   - Required for high-value transactions

## Data Protection

### Encryption

1. **Data in Transit**
   - HTTPS required in production
   - TLS 1.2 minimum
   - Strong cipher suites only

2. **Data at Rest**
   - Passwords: bcrypt hashed
   - Sensitive fields: AES-256 encryption
   - Database: encrypted backups

3. **API Keys**
   - Stored as environment variables
   - Never logged
   - Masked in error messages

### Personal Data (GDPR/DPA Compliance)

1. **Data Minimization**
   - Collect only necessary information
   - Regular data cleanup
   - Anonymize analytics data

2. **User Rights**
   - Account deletion endpoint
   - Data export capability
   - Consent management

3. **Logging**
   - No PII in application logs
   - Anonymize IP addresses
   - Secure log storage

## Security Monitoring

### Automated Scanning

1. **Dependency Scanning**
   ```bash
   # Check for vulnerabilities
   pip-audit
   safety check
   
   # Update dependencies
   pip install -U -r requirements.txt
   ```

2. **Code Security**
   ```bash
   # Static analysis
   bandit -r backend/
   
   # Security linting
   flake8 backend/ --select=S
   ```

3. **Secret Detection**
   ```bash
   # Scan for secrets in git history
   gitleaks detect --source . --verbose
   
   # Scan for exposed secrets
   trufflehog git file://. --only-verified
   ```

### CI/CD Security

GitHub Actions workflows automatically run:

- Dependency vulnerability scans
- Secret detection scans
- Static code analysis
- Container security scans
- Configuration validation

### Monitoring & Alerting

1. **Application Metrics**
   - Failed login attempts
   - Rate limit violations
   - API error rates
   - Response times

2. **Security Events**
   - Multiple failed 2FA attempts
   - Unusual trading patterns
   - Large withdrawal requests
   - API key usage spikes

3. **Alert Thresholds**
   - Failed logins: 10 per minute
   - 429 errors: 100 per hour
   - 5xx errors: 50 per hour
   - Database errors: 20 per hour

## Incident Response

### Response Procedure

1. **Detection**
   - Automated alerts
   - User reports
   - Security scans

2. **Containment**
   - Isolate affected systems
   - Revoke compromised credentials
   - Enable additional logging

3. **Investigation**
   - Review logs
   - Identify scope
   - Determine root cause

4. **Remediation**
   - Apply security patches
   - Rotate all secrets
   - Update security controls

5. **Communication**
   - Notify affected users (if required)
   - Document incident
   - Update security procedures

### Contact Information

- **Security Team**: security@stocksoko.com
- **Emergency Hotline**: [To be configured]
- **Bug Bounty**: [To be configured]

## Security Checklist

### Pre-Production

- [ ] All secrets in environment variables
- [ ] No `.env` files in repository
- [ ] `.env.example` is up to date
- [ ] `DEBUG=false` in production
- [ ] Strong `JWT_SECRET` configured
- [ ] PostgreSQL database configured
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] File upload validation active
- [ ] Logging configured (no PII)
- [ ] Error messages sanitized
- [ ] 2FA enabled for admins

### Post-Deployment

- [ ] Security scan passed
- [ ] Dependency audit clean
- [ ] Secrets rotated
- [ ] Backups configured
- [ ] Monitoring active
- [ ] Alerts configured
- [ ] Incident response plan documented
- [ ] Security training completed

### Regular Maintenance

- [ ] Monthly dependency updates
- [ ] Quarterly secret rotation
- [ ] Weekly security scan review
- [ ] Daily monitoring check
- [ ] Annual penetration testing
- [ ] Bi-annual security audit

## Security Updates

This document is reviewed and updated quarterly. Last update: 2026-01-19

For the latest security advisories, check:
- GitHub Security Advisories
- [CHANGELOG.md](./CHANGELOG.md)
- Security mailing list (to be configured)

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [FastAPI Security Best Practices](https://fastapi.tiangolo.com/tutorial/security/)
- [Python Security Best Practices](https://python.org/dev/security/)

---

**Remember: Security is everyone's responsibility. When in doubt, ask the security team.**
