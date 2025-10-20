import { PrismaClient } from '@prisma/client';

async function testDatabase() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "mysql://root:mysql.botilyx2024@10.10.102.2:30002/botilyx_db"
      }
    }
  });

  try {
    console.log('🔍 Probando conexión a la base de datos...');
    
    // Probar conexión básica
    await prisma.$connect();
    console.log('✅ Conexión exitosa a MySQL');
    
    // Verificar tablas
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'botilyx_db'
    `;
    console.log('📊 Tablas encontradas:', tables);
    
    // Probar consulta simple
    const userCount = await prisma.user.count();
    console.log(`👥 Usuarios en la base de datos: ${userCount}`);
    
    // Probar consulta de medicamentos
    const medicationCount = await prisma.medication.count();
    console.log(`💊 Medicamentos en la base de datos: ${medicationCount}`);
    
    console.log('🎉 Todas las pruebas de base de datos pasaron exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en las pruebas de base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
