# Script para ver logs de Android en tiempo real
# Filtra logs de React Native y la aplicación

Write-Host "Conectando con el dispositivo Android..." -ForegroundColor Green
Write-Host "Presiona Ctrl+C para detener" -ForegroundColor Yellow
Write-Host ""

adb logcat -c  # Limpiar logs anteriores

# Filtrar logs relevantes de React Native y la app
adb logcat | Select-String -Pattern "ReactNative|ReactNativeJS|ExpoModules|Expo|NetworkError|ERR_|addone|production|orders" -CaseSensitive:$false
