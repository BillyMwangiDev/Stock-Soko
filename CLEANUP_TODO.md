# Stock Soko Cleanup Checklist

This checklist ensures a full technical cleanup, standardization, and optimization following best practices for production-ready applications.

---

## Phase 1: Documentation Cleanup

**Policy:** Only `README.md` should exist for documentation. All other docs must be removed.

- [ ] Delete all unnecessary documentation files:
  - [ ] Delete: `DEMO_TRADING_ENABLED.md`
  - [ ] Delete: `FINAL_STATUS_REPORT.md`
  - [ ] Delete: `QUICK_START_GUIDE.md`
  - [ ] Delete: `SERVER_STATUS.md`
  - [ ] Delete: `TEST_RESULTS_SUMMARY.txt`
  - [ ] Delete: `KEYBOARD_FIX_APPLIED.md`
  - [ ] Delete: `NETWORK_FIX_GUIDE.md`
  - [ ] Delete: `PERFORMANCE_FIX_APPLIED.md`
  - [ ] Delete: `RELOAD_APP.txt`
  - [ ] Delete: `SERVERS_RESTARTED_SUCCESS.md`
  - [ ] Delete: `TRADE_UI_IMPROVED.md`
  - [ ] Delete: `UX_INTEGRATION_REPORT.md`
  - [ ] Delete: `DEMO_TRADING_QUICK_START.txt`
  
- [ ] Consolidate `README.md`:
  - [ ] Remove all emojis from README.md
  - [ ] Add project overview and architecture summary
  - [ ] Add setup and environment configuration
  - [ ] Add installation and startup instructions (reference startup.bat)
  - [ ] Add deployment process
  - [ ] Add testing and CI/CD details
  - [ ] Add API documentation or reference to /docs and /redoc
  - [ ] Ensure consistent formatting (no decorative characters)

- [ ] Optional: Create single `docs/` folder:
  - [ ] Move ERDs and architecture diagrams here if needed
  - [ ] Keep it minimal - no duplicate information

---

## Phase 2: Startup Scripts Cleanup

**Policy:** Only ONE startup script should exist: `startup.bat`

- [ ] Verify `startup.bat` functionality:
  - [ ] Runs environment checks
  - [ ] Loads .env variables correctly
  - [ ] Starts backend (FastAPI) correctly
  - [ ] Starts frontend (Expo) correctly
  - [ ] Includes error handling
  - [ ] Logs startup events
  
- [ ] Delete redundant scripts and test files:
  - [ ] Delete: `test_backend.py` (move to tests/ if needed)
  - [ ] Delete: `comprehensive_test.py` (move to tests/ if needed)
  - [ ] Delete: `seed_database.py` (create proper migration or keep in migrations/)
  
- [ ] Remove duplicate database files:
  - [ ] Delete: `stocksoko.db` in root (keep only in backend/)
  - [ ] Update paths to reference single database location

---

## Phase 3: Code Quality - Backend (Python)

- [ ] Apply formatters and linters:
  - [ ] Run `black .` on all Python files
  - [ ] Run `isort .` on all imports
  - [ ] Run `flake8 .` and fix all violations
  - [ ] Run `mypy backend/` and add type hints where missing
  
- [ ] Code cleanup:
  - [ ] Remove all unused imports
  - [ ] Remove all commented-out code
  - [ ] Remove all print statements (replace with logging)
  - [ ] Remove all emojis from code comments and strings
  - [ ] Replace informal comments with professional ones
  - [ ] Remove magic numbers and hardcoded values (use constants)
  
- [ ] Documentation:
  - [ ] Add docstrings to all public functions (backend/app/services/)
  - [ ] Add docstrings to all route handlers (backend/app/routers/)
  - [ ] Add docstrings to all models (backend/app/database/models.py)
  - [ ] Document all Pydantic schemas (backend/app/schemas/)

---

## Phase 4: Code Quality - Frontend (TypeScript/React Native)

- [ ] Apply formatters and linters:
  - [ ] Run `npx prettier --write .` on all TypeScript files
  - [ ] Run `npx eslint . --fix` and fix remaining violations
  - [ ] Run `tsc --noEmit` to check for type errors
  
- [ ] Code cleanup:
  - [ ] Remove unnecessary console.log statements (keep only critical logging)
  - [ ] Remove all commented-out code
  - [ ] Remove all emojis from code (except user-facing UI where appropriate)
  - [ ] Replace informal comments with professional ones
  - [ ] Remove magic numbers and hardcoded values (use constants)
  
- [ ] Documentation:
  - [ ] Add JSDoc comments to complex functions
  - [ ] Document all custom hooks
  - [ ] Document all context providers
  - [ ] Document navigation structure

---

## Phase 5: Security Audit

### Backend Security

- [ ] Environment and secrets:
  - [ ] Verify `DEBUG = False` in production config
  - [ ] Create `.env.example` file with all required variables
  - [ ] Verify all secrets are in .env, not hardcoded
  - [ ] Check JWT_SECRET is not default value in production
  
- [ ] Django/FastAPI security:
  - [ ] Review CORS settings (backend/app/config.py)
  - [ ] Verify JWT expiration is reasonable (60 min default)
  - [ ] Check file upload size limits (MAX_UPLOAD_SIZE_MB)
  - [ ] Verify input validation on all endpoints
  - [ ] Check SQL injection protection (using ORM properly)
  
- [ ] Run security scans:
  - [ ] Run `pip-audit` on Python dependencies
  - [ ] Run `bandit -r backend/` for security issues
  - [ ] Run `safety check` on requirements.txt
  - [ ] Fix all HIGH and CRITICAL vulnerabilities

### Frontend Security

- [ ] Run security scans:
  - [ ] Run `npm audit` in frontend/
  - [ ] Run `npm audit fix` for auto-fixable issues
  - [ ] Review remaining vulnerabilities
  - [ ] Update dependencies with security issues
  
- [ ] Code review:
  - [ ] Verify API keys are not exposed in frontend code
  - [ ] Check AsyncStorage usage (no sensitive data stored)
  - [ ] Review authentication token handling

---

## Phase 6: Dependencies Management

### Python Dependencies

- [ ] Clean up Python packages:
  - [ ] Run `pip list` and identify unused packages
  - [ ] Run `pip check` to verify compatibility
  - [ ] Update `requirements.txt` with current versions
  - [ ] Remove any unused dependencies
  - [ ] Pin all dependency versions (no >= or ~)
  
- [ ] Verify imports:
  - [ ] Check for circular imports
  - [ ] Remove unused imports
  - [ ] Organize imports consistently (stdlib, third-party, local)

### JavaScript Dependencies

- [ ] Clean up npm packages:
  - [ ] Run `npm prune` to remove unused packages
  - [ ] Review `package.json` for unused dependencies
  - [ ] Update outdated packages: `npm outdated`
  - [ ] Lock all dependency versions in package.json
  - [ ] Ensure `package-lock.json` is committed

---

## Phase 7: Testing

### Backend Tests

- [ ] Review existing tests in `tests/`:
  - [ ] Ensure tests are meaningful (not trivial)
  - [ ] Remove placeholder tests
  - [ ] Update tests to match current code
  
- [ ] Add missing tests:
  - [ ] Test authentication endpoints (login, register, JWT)
  - [ ] Test trading endpoints (place order, cancel order)
  - [ ] Test portfolio endpoints (positions, balance)
  - [ ] Test market data endpoints (stocks, quotes)
  - [ ] Test mock trading engine
  
- [ ] Run coverage:
  - [ ] Run `pytest --cov=backend tests/`
  - [ ] Aim for 80% coverage minimum
  - [ ] Identify untested critical paths
  - [ ] Add tests for critical paths

### Frontend Tests

- [ ] Set up Jest and React Testing Library:
  - [ ] Configure Jest for React Native
  - [ ] Add test scripts to package.json
  
- [ ] Add component tests:
  - [ ] Test trading flow (Markets -> StockDetail -> TradeOrder)
  - [ ] Test portfolio display
  - [ ] Test demo mode functionality
  - [ ] Test authenticated mode
  
- [ ] Run coverage:
  - [ ] Run `npm test -- --coverage`
  - [ ] Aim for 80% coverage on critical components

### CI/CD

- [ ] Set up GitHub Actions or GitLab CI:
  - [ ] Create `.github/workflows/ci.yml`
  - [ ] Add backend test job (pytest)
  - [ ] Add frontend test job (jest)
  - [ ] Add linting job (flake8, eslint)
  - [ ] Add security scanning job (pip-audit, npm audit)
  - [ ] Ensure all jobs must pass before merge

---

## Phase 8: Performance Optimization

### Backend Performance

- [ ] Database optimization:
  - [ ] Review all database queries
  - [ ] Add `select_related` and `prefetch_related` where needed
  - [ ] Add database indexes for frequently queried fields
  - [ ] Check for N+1 query problems
  
- [ ] Caching:
  - [ ] Set up Redis for caching (REDIS_URL in config)
  - [ ] Cache market data (PRICE_CACHE_TTL, HISTORICAL_CACHE_TTL)
  - [ ] Cache user sessions
  - [ ] Implement cache invalidation strategy
  
- [ ] API optimization:
  - [ ] Profile slow endpoints
  - [ ] Optimize serialization
  - [ ] Add pagination to list endpoints
  - [ ] Use async operations where possible

### Frontend Performance

- [ ] React Native optimization:
  - [ ] Implement lazy loading for screens
  - [ ] Add memoization (useMemo, useCallback) where needed
  - [ ] Optimize re-renders
  - [ ] Use FlatList virtualization for long lists
  
- [ ] Asset optimization:
  - [ ] Compress images in `assets/images/`
  - [ ] Use appropriate image formats (WebP where supported)
  - [ ] Implement code splitting
  - [ ] Bundle size analysis
  
- [ ] API calls optimization:
  - [ ] Implement request debouncing
  - [ ] Cache API responses where appropriate
  - [ ] Minimize unnecessary API calls
  - [ ] Use optimistic updates

---

## Phase 9: Database Management

- [ ] Clean up database files:
  - [ ] Remove duplicate `stocksoko.db` from root
  - [ ] Keep single source in `backend/stocksoko.db`
  - [ ] Update all references to use single location
  
- [ ] Migrations:
  - [ ] Review `backend/migrations/` folder
  - [ ] Ensure all model changes have migrations
  - [ ] Test migrations on clean database
  - [ ] Document migration process
  
- [ ] Backup and recovery:
  - [ ] Create database backup script
  - [ ] Document backup schedule
  - [ ] Create restore procedure
  - [ ] Test backup/restore process
  
- [ ] Schema documentation:
  - [ ] Document all database tables
  - [ ] Create ERD diagram
  - [ ] Document relationships and constraints

---

## Phase 10: CI/CD and Deployment

- [ ] CI/CD pipeline:
  - [ ] Create GitHub Actions workflow
  - [ ] Add linting step (black, flake8, eslint, prettier)
  - [ ] Add testing step (pytest, jest)
  - [ ] Add security scanning (bandit, safety, npm audit)
  - [ ] Add build step
  - [ ] Add deployment step (staging)
  - [ ] Add deployment step (production) with manual approval
  
- [ ] Docker setup:
  - [ ] Create `Dockerfile` for backend
  - [ ] Create `Dockerfile` for frontend (if web version)
  - [ ] Create `docker-compose.yml` for local development
  - [ ] Test Docker builds
  - [ ] Document Docker usage
  
- [ ] Deployment configuration:
  - [ ] Set up staging environment
  - [ ] Set up production environment
  - [ ] Configure environment variables for each
  - [ ] Set up reverse proxy (Nginx) configuration
  - [ ] Enable HTTPS (SSL certificates)
  - [ ] Set up monitoring (Prometheus/Grafana)
  - [ ] Set up error tracking (Sentry)

---

## Phase 11: Final Audit and Validation

- [ ] Documentation verification:
  - [ ] Confirm only `README.md` exists for docs
  - [ ] Verify README.md has no emojis
  - [ ] Ensure README.md is comprehensive and accurate
  
- [ ] Startup verification:
  - [ ] Confirm only `startup.bat` exists for startup
  - [ ] Test startup.bat on clean environment
  - [ ] Verify all services start correctly
  
- [ ] Code verification:
  - [ ] Run all formatters (black, prettier)
  - [ ] Run all linters (flake8, eslint)
  - [ ] Fix any remaining issues
  - [ ] Verify no emojis in code
  - [ ] Verify no commented-out code
  
- [ ] Security verification:
  - [ ] All secrets in .env
  - [ ] DEBUG = False in production
  - [ ] All security scans pass
  - [ ] No HIGH or CRITICAL vulnerabilities
  
- [ ] Testing verification:
  - [ ] All tests pass
  - [ ] Coverage >= 80%
  - [ ] CI/CD pipeline succeeds
  
- [ ] Manual testing:
  - [ ] Test complete user journey: signup -> trade -> portfolio
  - [ ] Test demo mode completely
  - [ ] Test authenticated mode completely
  - [ ] Test all API endpoints
  - [ ] Test error handling
  - [ ] Test on iOS (simulator/device)
  - [ ] Test on Android (emulator/device)
  
- [ ] Performance testing:
  - [ ] Test app responsiveness
  - [ ] Check API response times
  - [ ] Verify database query performance
  - [ ] Test with production data volume
  
- [ ] Final steps:
  - [ ] Conduct peer code review
  - [ ] Update changelog
  - [ ] Tag release as `v1.0.0`
  - [ ] Deploy to staging
  - [ ] Final smoke test on staging
  - [ ] Deploy to production
  - [ ] Monitor production for 24 hours

---

## Completion Criteria

- [x] Demo trading affects portfolio correctly (cash balance tracked)
- [ ] Only README.md exists for documentation
- [ ] Only startup.bat exists for startup
- [ ] No emojis anywhere in code or docs
- [ ] All linters pass (black, flake8, eslint, prettier)
- [ ] All tests pass with >=80% coverage
- [ ] All security scans pass
- [ ] CI/CD pipeline green
- [ ] Manual testing complete
- [ ] Production deployment successful

---

**Target Completion Date:** _Set based on team capacity_

**Assigned To:** _Development Team_

**Priority:** HIGH - Required for production readiness

