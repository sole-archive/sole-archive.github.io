// Publish dist/ to the gh-pages branch.
//
// Replaces `npx gh-pages`, which breaks on Windows (ENAMETOOLONG, and
// "Permission denied" / "Deletion of directory failed" when Windows briefly
// locks folders). This script never checks files out or deletes anything on
// disk: it keeps a bare copy of the repository and builds the new commit
// directly from dist/ using git's index, so there is nothing to lock.
//
// Behaviour matches gh-pages: the branch ends up containing exactly dist/
// (deleted or renamed pages disappear from the live site), committed as
// "Updates" on top of the existing history.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const BRANCH = 'gh-pages';
const CACHE = path.join(ROOT, 'node_modules', '.cache');
const REPO = path.join(CACHE, 'deploy-gh-pages.git');
const INDEX = path.join(REPO, 'deploy-index');

const env = {
  ...process.env,
  GIT_ASK_YESNO: 'false', // never stop to ask "Should I try again? (y/n)"
  GIT_INDEX_FILE: INDEX,
};

function git(args, { cwd = ROOT, capture = false, workTree } = {}) {
  const pre = ['-c', 'core.autocrlf=false', '-c', 'core.safecrlf=false', `--git-dir=${REPO}`];
  if (workTree) pre.push(`--work-tree=${workTree}`);
  return execFileSync('git', [...pre, ...args], {
    cwd,
    env,
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : ['ignore', 'inherit', 'inherit'],
    encoding: 'utf8',
  });
}

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('dist/index.html not found. Run `npm run build` first.');
  process.exit(1);
}

// Leftover from an earlier version of this script; remove it if Windows lets us.
try {
  fs.rmSync(path.join(CACHE, 'deploy-gh-pages'), { recursive: true, force: true, maxRetries: 3 });
} catch {}

const remote = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: ROOT, encoding: 'utf8' }).trim();

// 1. Get the latest gh-pages commit into a bare repository (no files on disk).
if (!fs.existsSync(path.join(REPO, 'HEAD'))) {
  console.log(`Setting up local copy of ${BRANCH}…`);
  fs.mkdirSync(REPO, { recursive: true });
  git(['init', '--quiet', '--bare']);
  git(['remote', 'add', 'origin', remote]);
} else {
  git(['remote', 'set-url', 'origin', remote]);
}
console.log(`Fetching ${BRANCH} from ${remote}…`);
git(['fetch', '--quiet', 'origin', `+refs/heads/${BRANCH}:refs/heads/${BRANCH}`]);

// 2. Build a tree containing exactly the contents of dist/.
console.log('Staging dist/…');
git(['read-tree', '--empty']);
git(['add', '-A', '--force', '.'], { cwd: DIST, workTree: DIST });
const tree = git(['write-tree'], { capture: true }).trim();
const parentTree = git(['rev-parse', `${BRANCH}^{tree}`], { capture: true }).trim();

if (tree === parentTree) {
  console.log('Nothing changed since the last deploy. Done.');
  process.exit(0);
}

// 3. Commit on top of gh-pages and push.
const parent = git(['rev-parse', BRANCH], { capture: true }).trim();
const commit = git(['commit-tree', tree, '-p', parent, '-m', 'Updates'], { capture: true }).trim();
git(['update-ref', `refs/heads/${BRANCH}`, commit, parent]);
git(['--no-pager', 'diff', '--stat=100', '--summary', parent, commit]);
console.log(`Pushing ${commit.slice(0, 7)} to ${BRANCH}…`);
git(['push', 'origin', `${BRANCH}:${BRANCH}`]);
console.log('Published.');
