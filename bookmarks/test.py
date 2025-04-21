import requests

url = "http://127.0.0.1:8000/api/v1/categories/"
data = {
    "name": "Mathematics"
}

response = requests.post(url, json=data)
print(response.json())