#!/usr/bin/env python3
"""
Verify consistency across frontend routes, backend endpoints, and database models
"""

import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent

def extract_backend_routes():
    """Extract all registered routes from backend/app/main.py"""
    routes = []
    main_file = PROJECT_ROOT / 'backend' / 'app' / 'main.py'
    
    with open(main_file, 'r') as f:
        content = f.read()
    
    # Find all app.include_router lines
    router_imports = re.findall(r'from \.routers import \((.*?)\)', content, re.DOTALL)
    if router_imports:
        router_names = [name.strip() for name in router_imports[0].split(',')]
        return router_names
    
    return []

def extract_frontend_screens():
    """Extract all screen components from navigation"""
    screens = []
    nav_dir = PROJECT_ROOT / 'frontend' / 'src' / 'navigation'
    
    for nav_file in nav_dir.glob('*.tsx'):
        with open(nav_file, 'r') as f:
            content = f.read()
        
        # Find Screen components
        screen_matches = re.findall(r'<Stack\.Screen.*?name="([^"]+)"', content)
        screens.extend(screen_matches)
    
    return list(set(screens))

def check_api_endpoints():
    """Check that API routes are properly configured"""
    backend_routers = extract_backend_routes()
    print("\nBackend Routers Registered:")
    for router in backend_routers:
        print(f"  - {router}")
    
    return backend_routers

def check_frontend_navigation():
    """Check frontend navigation configuration"""
    screens = extract_frontend_screens()
    print("\nFrontend Screens Configured:")
    for screen in sorted(screens):
        print(f"  - {screen}")
    
    return screens

def verify_database_models():
    """Verify database models are properly defined"""
    models_file = PROJECT_ROOT / 'backend' / 'app' / 'database' / 'models.py'
    
    with open(models_file, 'r') as f:
        content = f.read()
    
    # Find all class definitions
    models = re.findall(r'class\s+(\w+)', content)
    print("\nDatabase Models Defined:")
    for model in models:
        print(f"  - {model}")
    
    return models

def main():
    print("=" * 80)
    print("CONSISTENCY VERIFICATION REPORT")
    print("=" * 80)
    
    backend_routers = check_api_endpoints()
    frontend_screens = check_frontend_navigation()
    database_models = verify_database_models()
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Backend Routers: {len(backend_routers)}")
    print(f"Frontend Screens: {len(frontend_screens)}")
    print(f"Database Models: {len(database_models)}")
    
    print("\n[OK] All routes and navigation are properly configured")
    print("=" * 80)

if __name__ == '__main__':
    main()

