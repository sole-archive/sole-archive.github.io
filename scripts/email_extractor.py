import json

with open("src/content/papers.json", "r", encoding="utf-8") as f:
    papers = json.load(f)

emails = sorted({
    paper["corresponding_email"]
    for paper in papers
    if paper.get("corresponding_email")
})
counter=0
for email in emails:
    counter+=1
    print(email)

print(f"Total emails: {counter}")