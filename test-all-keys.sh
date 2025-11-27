#!/bin/bash

# An array of all the API key environment variable names
API_ENV_VARS=(
  APIFY_API_TOKEN
  APIFY_API_TOKEN_2
  APIFY_API_TOKEN_3
  APIFY_API_TOKEN_4
  APIFY_API_TOKEN_5
  APIFY_API_TOKEN_6
  APIFY_API_TOKEN_7
  APIFY_API_TOKEN_8
  APIFY_API_TOKEN_9
  APIFY_API_TOKEN_10
)

echo "🧪 Starting test for all configured API keys..."

# Loop through each environment variable name
for ENV_VAR in "${API_ENV_VARS[@]}"
do
  # Get the actual API key from the environment variable
  API_KEY=${!ENV_VAR}

  # Check if the key exists
  if [ -z "$API_KEY" ]; then
    echo "
--- ⏭️  Skipping $ENV_VAR (not set) ---"
    continue
  fi

  echo "
--- 🔍 Testing Key from $ENV_VAR ---"
  
  # Run the actor_test.js script with the current API key
  APIFY_API_TOKEN=$API_KEY node actor_test.js
done

echo "
✅ All key tests complete."
