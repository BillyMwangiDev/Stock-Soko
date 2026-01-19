# Deployment Security Checklist

## Pre-Deployment Security Checklist

Use this checklist before every production deployment.

### Environment Configuration

- [ ] `.env` file exists and is properly configured
- [ ] `.env` is in `.gitignore` and NOT committed to repository
- [ ] `.env.example` is up to date with all required variables
- [ ] No real secrets in `.env.example`

### Secrets Management

- [ ] `JWT_SECRET` is set to a strong, random 64+ character string
- [ ] `JWT_SECRET` is different from development/staging
- [ ] `DATABASE_URL` uses PostgreSQL (not SQLite) in production
- [ ] Database credentials are strong and unique
- [ ] `***REMOVED***` is secure and not the default
- [ ] All API keys are production keys (not sandbox/test)
- [ ] `MPESA_CONSUMER_SECRET` is production secret
- [ ] AWS credentials are scoped with least privilege
- [ ] All secrets have been rotated in last 90 days

### Application Configuration

- [ ] `ENVIRONMENT=production`
- [ ] `DEBUG=false`
- [ ] `LOG_LEVEL=INFO` or `WARNING` (not `DEBUG`)
- [ ] Error messages don't expose sensitive information
- [ ] Stack traces are disabled in production

### Security Features

- [ ] HTTPS is enabled and enforced
- [ ] Security headers middleware is active
- [ ] Rate limiting is configured and tested
- [ ] CORS is properly configured (not `*` for all origins)
- [ ] JWT token expiration is appropriate (60 minutes or less)
- [ ] 2FA is enabled for admin accounts
- [ ] Session timeout is configured

### Database Security

- [ ] Database is using PostgreSQL (not SQLite)
- [ ] Database connections use SSL/TLS
- [ ] Database user has minimal required permissions
- [ ] Database backups are configured and tested
- [ ] Database backup encryption is enabled
- [ ] Regular backup retention policy is set

### Code Quality & Testing

- [ ] All tests pass (`pytest`)
- [ ] Security tests included in test suite
- [ ] Code coverage is >60%
- [ ] Linting passes (`flake8`, `bandit`)
- [ ] No `# noqa` or security check disables without justification

### Dependency Security

- [ ] Dependencies are up to date
- [ ] No critical vulnerabilities (`pip-audit`)
- [ ] No high-severity vulnerabilities (`safety check`)
- [ ] Dependency versions are pinned in `requirements.txt`
- [ ] Unused dependencies removed

### Secret Detection

- [ ] No secrets in Git history (`gitleaks detect`)
- [ ] No secrets in codebase (`trufflehog`)
- [ ] Pre-commit hooks installed and working
- [ ] Secret detection in CI/CD pipeline

### Infrastructure Security

- [ ] Firewall rules restrict access to necessary ports only
- [ ] SSH keys are being used (not passwords)
- [ ] Root login is disabled
- [ ] Fail2ban or similar brute-force protection is active
- [ ] System updates are current
- [ ] Log aggregation is configured

### Monitoring & Logging

- [ ] Application logging is configured
- [ ] No PII or sensitive data in logs
- [ ] Error tracking is active (Sentry or similar)
- [ ] Metrics collection is working (Prometheus)
- [ ] Alerts are configured for critical issues
- [ ] Security event monitoring is active

### API Security

- [ ] All endpoints have proper authentication
- [ ] Authorization checks are in place
- [ ] Input validation is active on all endpoints
- [ ] Rate limiting is working on sensitive endpoints
- [ ] API documentation is accurate (Swagger/OpenAPI)

### File Upload Security

- [ ] File size limits are enforced
- [ ] File type validation is strict
- [ ] Uploaded files are scanned for malware
- [ ] File storage has proper access controls
- [ ] Uploaded files are served from separate domain/CDN

### Third-Party Services

- [ ] All API keys are production keys
- [ ] API rate limits are documented and monitored
- [ ] Webhook signatures are verified
- [ ] Third-party service status pages are monitored
- [ ] Fallback mechanisms are in place

### Compliance & Legal

- [ ] Privacy policy is up to date
- [ ] Terms of service are current
- [ ] Data retention policy is documented
- [ ] User data export capability exists
- [ ] Account deletion functionality works
- [ ] Cookie consent (if applicable) is compliant

### Backup & Recovery

- [ ] Database backups run daily
- [ ] Backup restoration has been tested
- [ ] Backup retention policy is 30+ days
- [ ] Backups are stored in separate location
- [ ] Disaster recovery plan is documented

### Documentation

- [ ] README.md is up to date
- [ ] SECURITY.md is current
- [ ] API documentation is accurate
- [ ] Deployment guide is clear
- [ ] Incident response plan is documented
- [ ] Runbook for common issues exists

## Post-Deployment Verification

### Immediate Checks (0-15 minutes)

- [ ] Application is accessible via HTTPS
- [ ] Health check endpoint responds correctly
- [ ] Login functionality works
- [ ] Critical user flows are functional
- [ ] API endpoints respond correctly
- [ ] No errors in application logs
- [ ] Database connections are stable

### Short-term Monitoring (1-24 hours)

- [ ] No spike in error rates
- [ ] Response times are normal
- [ ] No security alerts triggered
- [ ] Background jobs are running
- [ ] Email notifications are working
- [ ] Payment processing is functional
- [ ] Third-party integrations are stable

### Regular Monitoring (Ongoing)

- [ ] Daily log review for anomalies
- [ ] Weekly security scan review
- [ ] Monthly dependency updates
- [ ] Quarterly secret rotation
- [ ] Annual security audit
- [ ] Continuous uptime monitoring

## Emergency Rollback Criteria

Immediately rollback if:

- Critical security vulnerability is discovered
- Data breach is detected or suspected
- Authentication system fails
- Payment processing breaks
- Data corruption occurs
- Performance degrades >50%
- Error rate exceeds 5%

## Security Incident Response

If security issue is discovered post-deployment:

1. **Assess Severity**
   - Critical (P0): Immediate response required
   - High (P1): Response within 4 hours
   - Medium (P2): Response within 24 hours
   - Low (P3): Response within 1 week

2. **Immediate Actions**
   - Notify security team
   - Preserve evidence
   - Contain the issue
   - Document timeline

3. **Follow Incident Response Plan**
   - See: `docs/SECURITY_INCIDENT_RESPONSE.md`

## Tools & Commands

### Run Full Security Check

```bash
# Security audit
python scripts/security_audit.py

# Verify configuration
bash scripts/verify_security.sh

# Dependency vulnerabilities
pip-audit

# Code security
bandit -r backend/

# Secret detection
gitleaks detect --verbose

# Run all tests
pytest --cov=backend/app
```

### Emergency Secret Rotation

```bash
# Generate new secrets
python scripts/rotate_secrets.py

# Update environment (platform-specific)
# AWS: Update Systems Manager Parameter Store
# Heroku: heroku config:set JWT_SECRET=new_value
# Docker: Update environment variables and restart

# Verify application works
curl https://api.stocksoko.com/api/v1/health

# Revoke old secrets
```

## Sign-off

**Deployment Date**: _________________

**Deployed By**: _________________

**Reviewed By**: _________________

**Security Approved**: __________ (Yes/No)

**Notes**: 
```
___________________________________________________________________
___________________________________________________________________
___________________________________________________________________
```

**Checklist Completion**: _____ / _____ items complete

---

**Next Review Date**: _________________

**Last Updated**: 2026-01-19
