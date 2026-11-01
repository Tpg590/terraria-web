@echo off
chcp 65001 > nul
title Co Tien Lo - Auto Cay Luu Phai
echo ===================================================
echo     DANG KHOI DONG AUTO CAY LUU PHAI CO TIEN LO
echo ===================================================
echo.

python "%~dp0CotienloAuto.py"

if errorlevel 1 (
    echo.
    echo Co loi xay ra khi chay script! Vui long kiem tra Python va cac thu vien:
    echo pip install opencv-python pillow
    pause
)
