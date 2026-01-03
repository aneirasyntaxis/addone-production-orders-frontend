#!/usr/bin/env bash

echo "📦 Copiando network_security_config.xml..."

# Crear directorio si no existe
mkdir -p android/app/src/main/res/xml

# Copiar el archivo
cp android-network-security-config.xml android/app/src/main/res/xml/network_security_config.xml

echo "✅ network_security_config.xml copiado"
