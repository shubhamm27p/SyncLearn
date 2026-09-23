import requests
try:
    headers = {"Origin": "https://synclearn-osd4vkd4f-shubhamm27p.vercel.app"}
    res = requests.options("https://sync-learn-updated.onrender.com/api/mcq/tests", headers=headers, timeout=10)
    print("OPTIONS Status:", res.status_code)
    print("OPTIONS Headers:", res.headers)
    
    res2 = requests.get("https://sync-learn-updated.onrender.com/api/mcq/tests", headers=headers, timeout=10)
    print("GET Status:", res2.status_code)
    if res2.status_code == 500:
        print("Response:", res2.text)
except Exception as e:
    print(e)
