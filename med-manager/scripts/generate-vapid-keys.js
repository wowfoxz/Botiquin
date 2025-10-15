import webpush from 'web-push';
import crypto from 'crypto';

console.log('Generando claves VAPID...');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('\n=== CLAVES VAPID GENERADAS ===');
console.log('Clave pública:', vapidKeys.publicKey);
console.log('Clave privada:', vapidKeys.privateKey);

console.log('\n=== CONFIGURACIÓN PARA .env ===');
console.log('Agrega estas líneas a tu archivo .env:');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`NOTIFICATION_PROCESSOR_SECRET=${generateRandomSecret()}`);

console.log('\n=== CONFIGURACIÓN PARA NEXT.JS ===');
console.log('Agrega esta línea a tu archivo .env.local:');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);

function generateRandomSecret() {
  return crypto.randomBytes(32).toString('hex');
}
