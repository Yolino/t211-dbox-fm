import os

def get_secret(secret_name):
    try:
        with open(f"/run/secrets/{secret_name}", "r") as secret_file:
            return secret_file.read().strip()
    except FileNotFoundError:
        raise Exception(f"Cannot find secret {secret_name}")
