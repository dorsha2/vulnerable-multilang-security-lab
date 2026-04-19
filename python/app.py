import os
import pickle
import sqlite3
from flask import Flask, request

app = Flask(__name__)
API_KEY = "hardcoded-secret-api-key"  # intentionally insecure


def get_user_by_name(username: str):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    # SQL injection vulnerability (intentional)
    query = "SELECT id, username, password FROM users WHERE username = '" + username + "'"
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()
    return rows


@app.route("/run")
def run_command():
    cmd = request.args.get("cmd", "echo hello")
    # Command injection vulnerability (intentional)
    return os.popen(cmd).read()


@app.route("/load")
def load_pickle():
    payload = request.args.get("payload", "")
    # Unsafe deserialization vulnerability (intentional)
    obj = pickle.loads(bytes.fromhex(payload))
    return str(obj)


@app.route("/user")
def user_lookup():
    username = request.args.get("name", "")
    return {"rows": get_user_by_name(username), "debug_key": API_KEY}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
