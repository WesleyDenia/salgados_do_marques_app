#!/bin/bash

# Sobe o MySQL com docker-compose
cd /home/oem/Workspace/nas-backend &&
docker compose -f docker-compose.dev.yml up -d &&

cd /home/oem/Workspace/salgados-api &&
docker compose up -d &&

cd /home/oem/Workspace/salgados-app &&

npx expo start




