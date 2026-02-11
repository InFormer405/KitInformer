#!/bin/bash

echo "------------------------------------" >> worklog.txt
echo "Deploy executed at: $(date)" >> worklog.txt
echo "------------------------------------" >> worklog.txt

git add .
git commit -m "Deploy: $(date)"
git push origin main
