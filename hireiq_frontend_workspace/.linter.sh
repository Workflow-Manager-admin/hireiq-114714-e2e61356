#!/bin/bash
cd /home/kavia/workspace/code-generation/hireiq-114714-e2e61356/hireiq_frontend_workspace/hireiq_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

