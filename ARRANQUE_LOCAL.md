# Arranque local de RENALCARE en Mac

## 1. Base de datos
Abrir Postgres.app y arrancar el servidor existente.
Debe mostrar Running en el puerto 5432.

## 2. Servidor API
Abrir una Terminal y ejecutar:

cd "$HOME/Desktop/renalcare-sdk57/renal_care_app/nodejs_space"
YARN_NODE_LINKER=node-modules corepack yarn start:dev

Esperar el mensaje: RENAL-CARE API running on port 3000.
Mantener esta Terminal abierta.

## 3. App móvil
Abrir otra Terminal y ejecutar:

cd "$HOME/Desktop/renalcare-sdk57/renal_care_app/react_native_space"
YARN_NODE_LINKER=node-modules corepack yarn start --lan --port 8082

Mantener Mac e iPhone en la misma Wi-Fi.
Iniciar sesión con la misma cuenta de Expo en el Mac y Expo Go.
Escanear el QR nuevo con la cámara del iPhone.

## Configuración
El backend necesita su archivo .env local con DATABASE_URL y JWT_SECRET.
El frontend usa .env.local con EXPO_PUBLIC_API_URL.
Estos archivos no se guardan en GitHub.

Si cambia la IP del Mac, actualizar EXPO_PUBLIC_API_URL en .env.local.
Para consultar la IP: Ajustes del Sistema > Wi-Fi > Detalles > TCP/IP.
La dirección debe tener el formato http://IP_DEL_MAC:3000.
Después, reiniciar Expo.

## Copias## Copias## Copia copias están en ~/Desktop/renalcare-backups, fuera de Git.
Se ha probado una restauración separada: 12 tablas y 3 pacientes.
Repetir las copias cuandRepetir las copias cuandRepetir las copias cuandRepetirción segura fuera del Mac.

## Límites de la demo
Usar únicamente datos de demostración.
La ambulancia y los recordatorios están simulados.
Las consultas se guardan, pero no se entregan al hospital.

## Detener
Pulsar Control+C en las Terminales de Expo y del servidor.
