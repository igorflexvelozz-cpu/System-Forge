#!/usr/bin/env python3
import subprocess
import sys
import os

# Ensure we're in the correct directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Run uvicorn in production mode
subprocess.run([
    sys.executable, "-m", "uvicorn",
    "app.main:app",
    "--host", "0.0.0.0",
    "--port", "8001",
    "--workers", "4",  # Multiple workers for production
    "--loop", "uvloop",  # Faster loop
    "--http", "httptools"  # Faster HTTP
])