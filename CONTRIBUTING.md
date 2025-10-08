# Contributing to Stock Soko

Welcome to Stock Soko! This guide will help you get started with contributing to the project.

## Getting Started

### Prerequisites

- Python 3.13+
- Node.js 18+
- Git
- Expo Go app (for mobile testing)

### Clone the Repository

```bash
git clone https://github.com/BillyMwangiDev/Stock-Soko.git
cd Stock-Soko
```

### Backend Setup

1. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the backend server:**
   ```bash
   python -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo development server:**
   ```bash
   npx expo start --clear
   ```

4. **Run on your device:**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Press `w` for web
   - Press `a` for Android emulator
   - Press `i` for iOS simulator

## Project Structure

```
stock-soko/
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── routers/       # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── schemas/       # Pydantic models
│   │   ├── database/      # Database models
│   │   ├── ai/           # AI/ML features
│   │   └── utils/        # Utilities
├── frontend/              # React Native (Expo) frontend
│   ├── src/
│   │   ├── screens/      # App screens
│   │   ├── components/   # Reusable components
│   │   ├── navigation/   # Navigation setup
│   │   ├── theme/        # Theme & styling
│   │   └── api/          # API client
├── tests/                # Backend tests
├── docs/                 # Documentation
└── scripts/              # Utility scripts
```

## Development Workflow

### 1. Create a new branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make your changes
- Follow the existing code style
- Write tests for new features
- Update documentation as needed

### 3. Test your changes
```bash
# Backend tests
pytest tests/ -v

# Frontend (ensure no TypeScript errors)
cd frontend
npx tsc --noEmit
```

### 4. Commit your changes
```bash
git add .
git commit -m "feat: add your feature description"
```

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### 5. Push and create Pull Request
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style

### Python (Backend)
- Follow PEP 8
- Use type hints
- Maximum line length: 100 characters
- Use meaningful variable names

### TypeScript/JavaScript (Frontend)
- Use TypeScript for type safety
- Follow React Native best practices
- Use functional components with hooks
- Keep components small and focused

## Environment Variables

### Backend (.env)
Create a `.env` file in the project root:
```env
DATABASE_URL=sqlite:///./stocksoko.db
JWT_SECRET=your-secret-key
ENVIRONMENT=development
DEBUG=True
```

### Frontend
API URL is configured in `frontend/app.config.js`:
```javascript
extra: {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8000"
}
```

## Common Issues

### Issue: Module not found
**Backend:** Ensure virtual environment is activated and dependencies installed
**Frontend:** Delete `node_modules` and `package-lock.json`, then run `npm install`

### Issue: Port already in use
**Backend (8000):** Find and kill the process using the port
**Frontend (8081):** Stop the Expo server and restart

### Issue: Expo Go won't connect
- Ensure your computer and phone are on the same network
- Try using tunnel mode: `npx expo start --tunnel`

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Key Features

- **Mobile-First Design** - Built with React Native & Expo
- **Secure Authentication** - JWT-based auth with 2FA support
- **Real-time Market Data** - Live stock prices and charts
- **M-Pesa Integration** - Seamless payments
- **AI Assistant** - Intelligent trading recommendations
- **Portfolio Management** - Track holdings and performance

## Tech Stack

**Backend:**
- FastAPI (Python)
- SQLAlchemy (ORM)
- Pydantic (Data validation)
- PostgreSQL/SQLite (Database)
- Redis (Caching)

**Frontend:**
- React Native 0.76
- Expo SDK 54
- React Navigation 7
- TypeScript
- Victory Native (Charts)

## Getting Help

- Check existing issues on GitHub
- Read the documentation in `/docs`
- Ask questions in Pull Requests
- Contact the maintainers

## License

This project is proprietary. All rights reserved.

---

Happy coding!

