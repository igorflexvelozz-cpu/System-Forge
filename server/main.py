"""Top-level ASGI entrypoint to make `uvicorn main:app` work when run from the `server/` folder.

This file simply re-exports the FastAPI `app` instance from `app.main`.
"""

from app.main import app


if __name__ == "__main__":
    # Optional convenience when running this module directly
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
