const XLSX = require('xlsx');

const data = [
  { Rut: '11.111.111-1', Nombre: 'Juan', Apellidos: 'Pérez', Teléfono: '+56912345678' },
  { Rut: '22.222.222-2', Nombre: 'María', Apellidos: 'González', Teléfono: '+56987654321' },
  { Rut: '33.333.333-3', Nombre: 'Pedro', Apellidos: 'Soto', Teléfono: '+56911223344' },
  { Rut: '44.444.444-4', Nombre: 'Ana', Apellidos: 'Martínez', Teléfono: 'sin número' }
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');

XLSX.writeFile(workbook, 'clientes_prueba.xlsx');
console.log('Archivo de prueba creado exitosamente: clientes_prueba.xlsx');
