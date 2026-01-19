# Security Incident Response Plan

## Incident Classification

### Severity Levels

#### Critical (P0)
- Active data breach
- Exposed production credentials
- Unauthorized access to production systems
- Payment system compromise
- Customer data exposure

**Response Time**: Immediate (within 1 hour)

#### High (P1)
- Suspected unauthorized access
- Vulnerable dependency with active exploits
- Failed security control
- Suspicious activity patterns

**Response Time**: Within 4 hours

#### Medium (P2)
- Vulnerability without known exploits
- Security configuration issues
- Non-production credential exposure

**Response Time**: Within 24 hours

#### Low (P3)
- Security recommendations
- Hardening opportunities
- Documentation updates

**Response Time**: Within 1 week

## Response Procedures

### Phase 1: Detection & Triage

#### Detection Sources
1. Automated alerts (monitoring systems)
2. Security scans (CI/CD pipelines)
3. User reports
4. External notifications (GitGuardian, etc.)
5. Audit log analysis

#### Initial Assessment
1. Verify the incident is genuine
2. Classify severity level
3. Identify affected systems
4. Estimate scope of impact
5. Activate incident response team

### Phase 2: Containment

#### Immediate Actions

**For Exposed Credentials:**
1. Revoke compromised credentials immediately
2. Rotate all related secrets
3. Check access logs for unauthorized usage
4. Reset affected user passwords
5. Enable additional monitoring

**For Active Breaches:**
1. Isolate affected systems
2. Block suspicious IP addresses
3. Enable verbose logging
4. Capture system state for forensics
5. Preserve evidence

**For Vulnerabilities:**
1. Assess exploitability
2. Deploy temporary mitigations
3. Restrict access if necessary
4. Monitor for exploitation attempts

#### Containment Checklist

Critical Credential Exposure (e.g., SMTP_PASSWORD):
- [ ] Identify all exposed credentials
- [ ] Determine exposure duration
- [ ] Check Git history for other exposures
- [ ] Review access logs for unauthorized use
- [ ] Revoke compromised credentials at source
- [ ] Generate new secure credentials
- [ ] Update production environment variables
- [ ] Verify application functionality
- [ ] Remove credentials from Git history
- [ ] Update .env.example if needed
- [ ] Document incident timeline
- [ ] Notify affected parties if required

### Phase 3: Investigation

#### Evidence Collection
1. System logs
2. Application logs
3. Database access logs
4. Network traffic logs
5. Git commit history
6. CI/CD pipeline logs
7. Third-party service logs

#### Analysis Questions
- What was compromised?
- When did exposure occur?
- How was it exposed?
- Who had access?
- Was it exploited?
- What data was affected?
- What systems need remediation?

#### Tools & Commands

```bash
# Search Git history for secrets
git log --all --full-history --source --pretty=format:"%H %s" -S "PASSWORD"
gitleaks detect --source . --verbose --report-path gitleaks-report.json

# Check for unauthorized access
grep "401\|403\|Failed" /var/log/application.log

# Review database access
psql -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Check API usage patterns
curl http://localhost:8000/metrics | grep http_requests_total
```

### Phase 4: Remediation

#### Immediate Fixes
1. Apply security patches
2. Update vulnerable dependencies
3. Correct configuration issues
4. Strengthen access controls
5. Deploy monitoring enhancements

#### Code Changes
1. Remove hardcoded secrets
2. Add input validation
3. Implement additional security controls
4. Update security tests
5. Review related code for similar issues

#### Infrastructure Updates
1. Rotate all secrets
2. Update firewall rules
3. Review IAM permissions
4. Enable additional logging
5. Update backup procedures

### Phase 5: Recovery

#### Verification Steps
1. Confirm vulnerabilities are fixed
2. Test security controls
3. Verify monitoring is active
4. Check system functionality
5. Review access patterns

#### Restoration Process
1. Gradual service restoration
2. Monitor for anomalies
3. Verify data integrity
4. Confirm backup systems
5. Document changes

### Phase 6: Post-Incident

#### Documentation Requirements
1. Incident timeline
2. Root cause analysis
3. Impact assessment
4. Actions taken
5. Lessons learned
6. Preventive measures

#### Communication

**Internal:**
- Development team briefing
- Security team update
- Management summary
- Documentation updates

**External (if required):**
- User notifications
- Regulatory disclosures
- Public statements
- Security researcher acknowledgment

#### Preventive Measures
1. Update security controls
2. Enhance monitoring
3. Improve detection capabilities
4. Conduct security training
5. Update documentation
6. Schedule security review

## Specific Incident Playbooks

### Exposed Email Password (SMTP_PASSWORD)

**Immediate Actions:**
1. Access email service provider dashboard
2. Change password immediately
3. Review sent emails for last 30 days
4. Check for unauthorized email activity
5. Enable 2FA on email account if available

**Investigation:**
```bash
# Find when exposed
git log --all --full-history -S "SMTP_PASSWORD" --source

# Check for usage in code
grep -r "SMTP_PASSWORD" backend/ --exclude-dir=venv

# Review email service logs (provider-specific)
```

**Remediation:**
1. Generate strong password (20+ characters)
2. Update production environment variables
3. Remove from Git history:
   ```bash
   # Use BFG Repo-Cleaner or git filter-branch
   bfg --replace-text passwords.txt
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```
4. Force push cleaned history (coordinate with team)
5. Update .env.example to warn about this secret
6. Add to pre-commit hooks

**Prevention:**
- Add SMTP_PASSWORD to secret detection patterns
- Implement pre-commit hooks for secret detection
- Regular secret audits
- Security awareness training

### Database Credential Exposure

**Immediate Actions:**
1. Create new database user with strong password
2. Update application configuration
3. Revoke old database user
4. Review database access logs
5. Check for unauthorized queries

**Investigation:**
```bash
# PostgreSQL access logs
grep "authentication failed" /var/log/postgresql/postgresql.log

# Active connections
psql -c "SELECT * FROM pg_stat_activity;"

# Recent queries
psql -c "SELECT query, query_start FROM pg_stat_activity WHERE state = 'active';"
```

**Remediation:**
1. Rotate database credentials
2. Update connection strings
3. Implement connection pooling
4. Enable query logging
5. Restrict network access

### API Key Compromise

**Immediate Actions:**
1. Revoke compromised API key
2. Generate new API key
3. Update application configuration
4. Review API usage logs
5. Check for abnormal activity

**Investigation:**
- Review API provider dashboard
- Check usage patterns
- Analyze request logs
- Identify unauthorized requests

**Remediation:**
1. Update environment variables
2. Implement API key rotation schedule
3. Add usage monitoring
4. Set rate limits at provider
5. Enable alerts for unusual activity

## Contact Information

### Incident Response Team

**Security Lead**: security@stocksoko.com
**Development Lead**: dev@stocksoko.com
**Operations**: ops@stocksoko.com

### External Contacts

**Hosting Provider**: [Contact details]
**Database Provider**: [Contact details]
**Email Service**: [Contact details]
**Security Consultant**: [Contact details]

## Tools & Resources

### Security Scanning
- **pip-audit**: Python dependency security
- **bandit**: Python security linting
- **gitleaks**: Secret detection
- **trufflehog**: Secret scanning
- **safety**: Dependency vulnerability database

### Monitoring
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **ELK Stack**: Log aggregation
- **Sentry**: Error tracking

### Communication
- **PagerDuty**: Incident alerting
- **Slack**: Team communication
- **Email**: User notifications

## Training & Drills

### Regular Activities
- Monthly security reviews
- Quarterly incident response drills
- Annual security training
- Continuous security awareness

### Drill Scenarios
1. Credential exposure simulation
2. Unauthorized access detection
3. Data breach response
4. DDoS attack mitigation
5. Insider threat handling

## Review & Updates

This plan should be reviewed and updated:
- After each incident
- Quarterly (minimum)
- When systems change significantly
- When new threats emerge

**Last Updated**: 2026-01-19
**Next Review**: 2026-04-19

---

**Remember: Stay calm, follow the process, document everything.**
