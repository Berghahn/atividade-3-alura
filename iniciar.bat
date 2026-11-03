@echo off
title Lista de Tarefas - Inicializador
echo ======================================================
echo    INICIANDO APLICACAO DE LISTA DE TAREFAS
echo ======================================================
echo.
echo 1. Iniciando servidor PHP Backend em http://localhost:8000 ...
start "Backend PHP (SQLite)" cmd /c "php -S localhost:8000 -t backend"

echo 2. Iniciando servidor Frontend React (Vite)...
cd frontend
npm run dev
