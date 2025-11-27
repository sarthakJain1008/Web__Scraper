#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Step 1: Run the Node.js script to update the README ---
echo "🚀 Starting README update process..."
node update-readme.js

# --- Step 2: Git Operations ---
echo "🔍 Checking for changes in README.md..."

# Check if there are any changes to commit.
if ! git diff-index --quiet HEAD -- README.md; then
  echo "✅ README.md has been updated. Committing and pushing changes..."

  # Add the updated README.md to the staging area
  git add README.md

  # Commit the changes with a standardized message
  git commit -m "Docs: Auto-update scraping progress in README"

  # Stash any other local changes, pull from remote, then re-apply
  git stash
  git pull --rebase origin main
  git stash pop || true

  # Push the commit to the main branch on the origin remote
  git push origin main

  echo "🎉 Successfully pushed README update to GitHub!"
else
  echo "✅ No changes detected in README.md. Nothing to commit."
fi

echo "✨ README update process complete."
