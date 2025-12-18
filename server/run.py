#!/usr/bin/env python3
import subprocess
import sys
import os
from pathlib import Path

# Ensure we're in the correct directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Get the directory of the current script
current_dir = Path(__file__).parent.absolute()

# Add the server directory to Python path
sys.path.insert(0, str(current_dir))

# Run uvicorn with the correct module path
subprocess.run([
    sys.executable, "-m", "uvicorn",
    "app.main:app",
    "--host", "0.0.0.0",
    "--port", os.getenv("BACKEND_PORT", "8000"),
    "--reload",  # Enable auto-reload for development
    "--app-dir", str(current_dir)  # Set the application directory
])