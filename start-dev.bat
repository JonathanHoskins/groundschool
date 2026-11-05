@echo off
title Groundschool Dev Server
cd /d "%~dp0"
npm run dev -- --open --host
pause
