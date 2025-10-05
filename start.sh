#!/bin/sh
# This script starts the LanguageTool server in the background and then the Kolder app in the foreground.

# Start LanguageTool Server
# The '--allow-origin "*"' flag makes the API accessible from any origin.
echo "Starting LanguageTool server on port 8081..."
java -jar /app/languagetool/languagetool-server.jar --port 8081 --allow-origin '*' &

# Give LanguageTool a moment to start up before the main application begins.
sleep 5

# Start Kolder application in the foreground
echo "Starting Kolder server..."
node server/server.js