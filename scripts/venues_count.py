import json

# Load JSON file
with open("public/papers.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# If the file contains multiple papers, make sure it's a list
if isinstance(data, dict):
    papers = [data]
else:
    papers = data

console_venues = set()
affiliations = set()

# Collect values
for paper in papers:
    # console_venue (string)
    if "console_venue" in paper and paper["console_venue"]:
        console_venues.add(paper["console_venue"].strip())

    # affiliation (list of strings)
    if "affiliation" in paper and isinstance(paper["affiliation"], list):
        for aff in paper["affiliation"]:
            affiliations.add(aff.strip())

# Write to txt file
with open("venues_affiliations.txt", "w", encoding="utf-8") as f:
    f.write("Unique console_venues:\n")
    for v in sorted(console_venues):
        f.write(v + "\n")

    f.write("\nUnique affiliations:\n")
    for a in sorted(affiliations):
        f.write(a + "\n")

print("✅ Done! Results saved to venues_affiliations.txt")
