import json
import os
import re
from typing import Dict, List

import numpy as np
from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

STOPWORDS = frozenset({
    'the','and','of','in','to','a','for','on','with','by','from','as','at','is','it',
    'that','this','an','be','are','or','we','our','their','into','over','under',
    'without','across','via','about','also','has','have','been','which','they',
    'than','these','those','its','such','between','after','before','show','shows',
    'shown','argue','argues','argued','paper','present','presents','presented',
    'discuss','discusses','discussed','propose','proposes','proposed','analysis',
    'analyzes','analyzed','data','results','however','therefore','thus','while',
    'when','where','what','how','two','three','one','first','second','i','ii','iii',
})

_stemmer = PorterStemmer()
_TOKEN_RE = re.compile(r"[a-zA-Z][a-zA-Z'-]*[a-zA-Z]|[a-zA-Z]{2,}", re.UNICODE)


def _tokenize(text: str) -> List[str]:
    tokens = _TOKEN_RE.findall(text.lower())
    return [
        _stemmer.stem(t)
        for t in tokens
        if t not in STOPWORDS and len(t) >= 2
    ]


def _build_document(paper: Dict) -> str:
    """Weighted document: keywords × 4, title × 3, abstract × 1."""
    title = str(paper.get('title') or '')
    kw_list = paper.get('keywords') or []
    if isinstance(kw_list, str):
        kw_list = [kw_list]
    keywords = ' '.join(str(k) for k in kw_list)
    abstract = str(paper.get('abstract') or '')
    return ' '.join([keywords] * 4 + [title] * 3 + [abstract])


def main():
    root = os.path.dirname(os.path.dirname(__file__))
    papers_path = os.path.join(root, 'src', 'content', 'papers.json')

    with open(papers_path, 'r', encoding='utf-8') as f:
        papers: List[Dict] = json.load(f)

    for p in papers:
        p['related_slugs'] = []

    docs = [_build_document(p) for p in papers]
    slugs = [p.get('slug', f'paper_{i}') for i, p in enumerate(papers)]
    n = len(papers)

    vectorizer = TfidfVectorizer(
        tokenizer=_tokenize,
        token_pattern=None,
        min_df=2,        # term must appear in at least 2 papers
        max_df=0.85,     # ignore terms appearing in >85% of papers
        ngram_range=(1, 2),
        sublinear_tf=True,
    )
    tfidf_matrix = vectorizer.fit_transform(docs)

    sim_matrix = cosine_similarity(tfidf_matrix)

    TOP_K = 6
    MIN_K = 5

    for i, p in enumerate(papers):
        sim_row = sim_matrix[i].copy()
        sim_row[i] = -1.0

        top_indices = np.argsort(sim_row)[::-1]
        top_slugs = []
        for j in top_indices:
            if len(top_slugs) >= TOP_K:
                break
            cand = slugs[j]
            if cand and cand != slugs[i]:
                top_slugs.append(cand)

        if len(top_slugs) < MIN_K:
            for j in range(n):
                if len(top_slugs) >= MIN_K:
                    break
                cand = slugs[j]
                if cand and cand != slugs[i] and cand not in top_slugs:
                    top_slugs.append(cand)

        p['related_slugs'] = top_slugs

    with open(papers_path, 'w', encoding='utf-8') as f:
        json.dump(papers, f, ensure_ascii=False, indent=2)

    print(f"Updated related_slugs for {n} papers.")


if __name__ == '__main__':
    main()
