# 1. Base Image: Selected to be compatible with @playwright/test ^1.61.1
FROM mcr.microsoft.com/playwright:v1.61.1-jammy

# OCI Labels for maintainability
LABEL org.opencontainers.image.title="Playwright Dashboard Backend"
LABEL org.opencontainers.image.description="Backend service for executing Playwright tests and streaming artifacts"
LABEL org.opencontainers.image.version="1.0.0"

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Set the environment to production
ENV NODE_ENV=production

# 4. Maximize Docker Layer Caching for Dependencies
# NOTE: No .env files are copied. Production configuration comes entirely from Render environment variables.
COPY backend/package*.json ./backend/
COPY automation/package*.json ./automation/

# 5. Install Backend Dependencies
# Use `npm ci` for deterministic, clean installs. 
RUN cd backend && npm ci --omit=dev

# 6. Install Automation Dependencies
RUN cd automation && npm ci --include=dev

# 7. Dependency Verification
# Verify Playwright installation during image build to detect failures early.
RUN cd automation && npx playwright --version

# 8. Copy Source Code
# Explicitly copy only backend and automation, excluding the frontend.
COPY backend/ ./backend/
COPY automation/ ./automation/

# 9. Create Upload Directories for Artifacts
# Ensure the uploads directory hierarchy exists within the container so artifacts 
# can be saved immediately by the backend artifactScanner.js.
RUN mkdir -p /app/backend/uploads/reports \
  /app/backend/uploads/screenshots \
  /app/backend/uploads/videos \
  /app/backend/uploads/traces \
  /app/backend/uploads/logs

# 10. Set Permissions
# The Playwright base image provides a non-root user named 'pwuser'. 
# We grant this user ownership of the uploads folder so it can write artifacts securely.
RUN chown -R pwuser:pwuser /app/backend/uploads

# 11. Security: Switch to non-root user
USER pwuser

# 12. Expose the Express API port (Fallback, Render overrides this dynamically)
EXPOSE 4000

# 13. Healthcheck
# Using Node.js directly instead of curl for a cleaner, production-ready solution with no external binary dependency.
# It uses the dynamic PORT variable injected by Render, falling back to 4000.
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "const http = require('http'); const req = http.get('http://localhost:' + (process.env.PORT || 4000) + '/health', (res) => { if (res.statusCode !== 200) process.exit(1); process.exit(0); }); req.on('error', () => process.exit(1));"

# 14. Set working directory to backend where the start script lives
WORKDIR /app/backend

# 15. Start the Express backend
CMD ["npm", "start"]
