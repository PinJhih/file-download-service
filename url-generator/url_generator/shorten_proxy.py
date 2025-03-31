import requests

PROXY_URL = "http://shorten:9000"


def generate_shorten_url(file_name, url, expiry):
    file_info = {
        "name": file_name,
        "url": url,
        "expiry": expiry,
    }
    res = requests.post(f"{PROXY_URL}/shorten", json=file_info)

    short_url = res.json()["short_url"]
    return short_url
