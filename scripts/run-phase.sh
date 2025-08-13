#!/bin/bash

# A script to run a specific development task using the Gemini CLI.
# Usage: ./scripts/run-phase.sh [TASK_NAME]
# Example: ./scripts/run-phase.sh 0-bootstrap

# --- Configuration ---
TASK_NAME=$1
CONTEXT_FILE="prompts/gemini_lean_context.md"
PROMPT_FILE="prompts/${TASK_NAME}.md"
OUTPUT_DIR="output/${TASK_NAME}"
OUTPUT_FILE="${OUTPUT_DIR}/implementation_plan.md"

# --- Validation ---
if [ -z "$TASK_NAME" ]; then
  echo "Error: Please provide a task name (e.g., 0-bootstrap)."
  echo "Usage: $0 [TASK_NAME]"
  exit 1
fi

if [ ! -f "$PROMPT_FILE" ]; then
  echo "Error: Prompt file for task ${TASK_NAME} not found at ${PROMPT_FILE}"
  exit 1
fi

if [ ! -f "$CONTEXT_FILE" ]; then
  echo "Error: Master context file not found at ${CONTEXT_FILE}"
  exit 1
fi

# --- Execution ---
echo "▶️  Starting Gemini-Driven Development for Task: ${TASK_NAME}..."
mkdir -p "$OUTPUT_DIR"

# Corrected Command:
# This version pipes the combined context and task to the CLI's standard input
# and uses the --prompt "" flag to force non-interactive mode.
cat "$CONTEXT_FILE" "$PROMPT_FILE" | npx -y @google/gemini-cli@latest --debug --prompt "" > "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Success! Implementation plan for task ${TASK_NAME} has been generated."
  echo "   See details in: ${OUTPUT_FILE}"
else
  echo "❌ Error: Gemini CLI failed to generate the plan."
  if [ -s "$OUTPUT_FILE" ]; then
    echo "--- Output/Error from CLI ---"
    cat "$OUTPUT_FILE"
    echo "---------------------------"
  fi
fi