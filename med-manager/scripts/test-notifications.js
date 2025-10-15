import fetch from 'node-fetch';

// Script para probar el procesador de notificaciones
async function testNotificationProcessor() {
  const url = 'http://localhost:3000/api/notifications/process';
  const secret = process.env.NOTIFICATION_PROCESSOR_SECRET || 'b09f3096101b0491f2bece6d1e5a21aac88ea4058253f650692b503f90200343';

  try {
    console.log('Probando procesador de notificaciones...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Procesador funcionando correctamente:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error('❌ Error en el procesador:');
      console.error(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testNotificationProcessor();


