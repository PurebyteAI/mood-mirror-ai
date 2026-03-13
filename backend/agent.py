"""Compatibility shim — agent has moved to services/agent.py"""
import runpy, sys
from pathlib import Path

if __name__ == "__main__":
    sys.argv[0] = str(Path(__file__).parent / "services" / "agent.py")
    runpy.run_path(sys.argv[0], run_name="__main__")
