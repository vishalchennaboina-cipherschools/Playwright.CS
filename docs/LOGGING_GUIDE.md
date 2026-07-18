# Enterprise Logging System Guide

## Overview

The Playwright Automation Platform uses a centralized, structured logging system across all components (Frontend, Backend, and Automation framework). This ensures traceability, security (by masking sensitive data), and consistency for debugging and auditing.

## Architecture

The logging system is split into three main components, each tailored to its environment while maintaining a consistent mental model and log level hierarchy:

1. **Backend (Express)**: Powered by `winston` and `winston-daily-rotate-file`. Supports correlation IDs (Request & Execution IDs) using `AsyncLocalStorage`. Logs are output to the console and daily rotating files in `uploads/logs/`.
2. **Frontend (React)**: A lightweight, custom wrapper around the browser's `console` API (`frontend/src/lib/logger.ts`). Provides colorized output and strict categorization.
3. **Automation (Playwright)**: A dedicated logger (`automation/utils/logger.js`) that injects the current Execution ID into all logs. 

## Log Levels

| Level | Value | Usage |
| :--- | :--- | :--- |
| `FATAL` | 0 | System crash or unrecoverable error requiring immediate attention. |
| `ERROR` | 1 | A significant error occurred, but the system continues to run. |
| `WARN`  | 2 | A potential issue or deprecated usage that isn't fatal. |
| `SUCCESS`| 3 | A major operation completed successfully (e.g., server started, DB connected). |
| `INFO`  | 4 | General operational messages (e.g., API requests). |
| `DEBUG` | 5 | Detailed information useful for debugging. |
| `TRACE` | 6 | Extremely fine-grained information. |

## Categories

Always categorize your logs. This allows filtering logs by domain.
Available categories include:
- `SERVER`, `DATABASE`, `API`, `EXECUTION`, `PLAYWRIGHT`, `SOCKET`, `AUTH`, `UI`, `SYSTEM`

## Usage Examples

### Backend

```javascript
const logger = require('../utils/logger');

// Simple log
logger.info('User successfully authenticated', { category: logger.CATEGORIES.AUTH });

// Log with error and metadata (sensitive keys like "password" will be masked automatically)
logger.error('Failed to create user profile', {
  category: logger.CATEGORIES.API,
  error: err,
  userId: '12345',
  password: 'my-secret-password' // Will be logged as ***MASKED***
});
```

### Frontend

```typescript
import { logger } from '@/lib/logger';

logger.error('Failed to fetch executions', {
  category: logger.CATEGORIES.API,
  error: err
});
```

### Automation / Playwright

```javascript
const logger = require('../../utils/logger');

test('Verify login', async ({ page }) => {
  logger.info('Navigating to login page', { category: logger.CATEGORIES.UI });
  await page.goto('/login');
});
```

## Security (Masking)

The backend logger includes a `masking.js` utility that recursively strips sensitive information before it reaches the transport (console or file). It currently masks any key containing:
`password`, `token`, `secret`, `cookie`, `session`, `authorization`, `credentials`.

## Configuration

Environment variables available in `.env`:
- `LOG_LEVEL` (default: `info`)
- `LOG_DIR` (default: `uploads/logs`)
- `LOG_TO_FILE` (default: `true`)
- `LOG_TO_CONSOLE` (default: `true`)
