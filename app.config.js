const { withAndroidManifest, withDangerousMod, AndroidConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const config = {
  expo: {
    name: "BEM Production Orders",
    slug: "addone-production-orders-frontend",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.aneira.one.addoneproductionordersfrontend"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        function withCustomNetworkSecurityConfig(config) {
          // Primero, copiar el archivo XML
          config = withDangerousMod(config, [
            'android',
            async (config) => {
              const projectRoot = config.modRequest.projectRoot;
              const platformProjectRoot = config.modRequest.platformProjectRoot;
              
              const sourceFile = path.join(projectRoot, 'android-network-security-config.xml');
              const targetDir = path.join(platformProjectRoot, 'app', 'src', 'main', 'res', 'xml');
              const targetFile = path.join(targetDir, 'network_security_config.xml');
              
              // Crear directorio si no existe
              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
              }
              
              // Copiar archivo
              if (fs.existsSync(sourceFile)) {
                fs.copyFileSync(sourceFile, targetFile);
              }
              
              return config;
            },
          ]);

          // Luego, modificar el AndroidManifest
          config = withAndroidManifest(config, async (config) => {
            const androidManifest = config.modResults.manifest;

            // Agregar networkSecurityConfig al application
            if (androidManifest.application && androidManifest.application[0]) {
              androidManifest.application[0].$['android:networkSecurityConfig'] = '@xml/network_security_config';
            }

            return config;
          });
          
          return config;
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "022dd163-e8c3-4cc1-aa47-6f28e3d69c4b"
      }
    }
  }
};

module.exports = config;
