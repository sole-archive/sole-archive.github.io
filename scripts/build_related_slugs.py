import json
import os
import re
from collections import defaultdict
from typing import Dict, List, Set, Tuple


RE_WHITESPACE = re.compile(r"\s+")


def tokenize(text: str) -> List[str]:
    if not text:
        return []
    # Normalize whitespace and lowercase
    text = RE_WHITESPACE.sub(" ", text).lower()
    # Split on non-word characters; keep tokens that contain at least one alphanumeric
    tokens = re.split(r"\W+", text, flags=re.UNICODE)
    return [t for t in tokens if t and any(ch.isalnum() for ch in t)]


STOPWORDS: Set[str] = {
    # very small stopword set to reduce noise
    'the','and','of','in','to','a','for','on','with','by','from','as','at','is','it','that','this','an','be','are','or','we','our','their',
    'into','over','under','without','across','via','about','based','case','study','studies'
}


def build_token_sets(paper: Dict) -> Tuple[Set[str], Set[str], Set[str]]:
    title_tokens = {t for t in tokenize(paper.get('title', '')) if t not in STOPWORDS}
    kw_list = paper.get('keywords') or []
    if isinstance(kw_list, str):
        kw_list = [kw_list]
    keyword_tokens = set()
    for kw in kw_list:
        keyword_tokens.update(t for t in tokenize(str(kw)) if t not in STOPWORDS)
    abstract_tokens = {t for t in tokenize(paper.get('abstract', '')) if t not in STOPWORDS}
    return title_tokens, keyword_tokens, abstract_tokens


def score_pair(a: Tuple[Set[str], Set[str], Set[str]], b: Tuple[Set[str], Set[str], Set[str]]) -> int:
    a_title, a_kw, a_abs = a
    b_title, b_kw, b_abs = b
    # Weighted overlaps: emphasize keywords and titles, include cross overlaps
    score = 0
    score += 4 * len(a_kw & b_kw)
    score += 3 * len(a_title & b_title)
    score += 2 * len(a_title & b_kw)
    score += 2 * len(a_kw & b_title)
    score += 1 * len(a_abs & b_abs)
    # Small bonus if editions match (when available)
    return score


def main():
    root = os.path.dirname(os.path.dirname(__file__))
    papers_path = os.path.join(root, 'src', 'content', 'papers.json')
    backup_path = os.path.join(root, 'src', 'content', 'papers.backup.before_related.json')

    with open(papers_path, 'r', encoding='utf-8') as f:
        papers: List[Dict] = json.load(f)

    # Build token sets for all papers
    idx_by_slug: Dict[str, int] = {}
    features: List[Tuple[Set[str], Set[str], Set[str]]] = []
    for i, p in enumerate(papers):
        slug = p.get('slug')
        if not slug:
            slug = f"paper_{i}"
            p['slug'] = slug
        idx_by_slug[slug] = i
        features.append(build_token_sets(p))

    # Pre-compute scores matrix sparsely
    related: Dict[int, List[Tuple[int, int]]] = defaultdict(list)
    n = len(papers)
    for i in range(n):
        for j in range(i + 1, n):
            s = score_pair(features[i], features[j])
            # Always store to allow fallback to at least 5
            related[i].append((j, s))
            related[j].append((i, s))

    # For each paper, choose top K related slugs
    MIN_RELATED = 5
    TARGET_RELATED = 6  # choose a little more than minimum

    for i, p in enumerate(papers):
        scored = related.get(i, [])
        # Sort by score desc, then by year proximity (optional), then title
        year_i = p.get('year')
        def sort_key(item):
            j, s = item
            year_j = papers[j].get('year')
            year_delta = abs(int(year_i) - int(year_j)) if isinstance(year_i, int) and isinstance(year_j, int) else 9999
            title_j = papers[j].get('title', '')
            return (-s, year_delta, title_j)

        scored.sort(key=sort_key)
        top = [papers[j].get('slug') for j, s in scored[:max(TARGET_RELATED, MIN_RELATED)]]
        # Ensure unique and no self
        top = [slug for slug in top if slug and slug != p.get('slug')]
        # Fallback: pad if needed with any other slugs by order
        if len(top) < MIN_RELATED:
            for j in range(n):
                if len(top) >= MIN_RELATED:
                    break
                cand = papers[j].get('slug')
                if cand and cand != p.get('slug') and cand not in top:
                    top.append(cand)

        p['related_slugs'] = top

    # Backup and write
    if not os.path.exists(backup_path):
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(papers, f, ensure_ascii=False, indent=2)

    with open(papers_path, 'w', encoding='utf-8') as f:
        json.dump(papers, f, ensure_ascii=False, indent=2)

    print(f"Updated {papers_path} with related_slugs for {len(papers)} papers.")


if __name__ == '__main__':
    main()


