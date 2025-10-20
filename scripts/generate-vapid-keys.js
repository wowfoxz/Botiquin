import webpush from 'web-push';

async function generateKeys() {
  try {
    console.log('🔑 Generando claves VAPID para notificaciones push...\n');
    
    const vapidKeys = webpush.generateVAPIDKeys();
    
    console.log('✅ Claves VAPID generadas exitosamente:\n');
    console.log('📋 Copia estas claves a tu archivo de producción:\n');
    console.log('─'.repeat(60));
    console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
    console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
    console.log('VAPID_SUBJECT="mailto:admin@formosa.gob.ar"');
    console.log('─'.repeat(60));
    
    console.log('\n📝 Instrucciones:');
    console.log('1. Copia las claves VAPID al archivo env.production.kubernetes');
    console.log('2. Reemplaza estado: your-vapid-public-key-here y your-vapid-private-key-here');
    console.log('3. Estas claves son necesarias para las notificaciones push');
    console.log('4. Mantén la clave privada segura y no la compartas');
    
  } catch (error) {
    console.error('❌ Error generando claves VAPID:', error);
  }
}

generateKeys();