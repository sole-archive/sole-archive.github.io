import json

with open("src/content/papers.json", "r", encoding="utf-8") as f:
    papers = json.load(f)

counts = {}
for paper in papers:
    year = str(paper["year"])
    counts[year] = counts.get(year, 0) + 1

# Sort years for neatness
counts_sorted = dict(sorted(counts.items(), key=lambda x: int(x[0])))

# Save counts as JSON
with open("src/content/papers_counts.json", "w", encoding="utf-8") as f:
    json.dump(counts_sorted, f, indent=2)

print("papers_counts.json generated.")
