import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Packaging materials inventory
const packagingMaterials = [
  { name: '24ozcup', stock: 500 },
  { name: '20ozcup', stock: 300 },
  { name: 'elote grande', stock: 200 },
  { name: 'elote chico', stock: 400 },
  { name: '16ozcupclear', stock: 300 },
  { name: 'charolas', stock: 150 },
  { name: 'chetos', stock: 100 },
  { name: 'conchitas', stock: 100 },
  { name: 'sopas', stock: 200 },
  { name: 'takis', stock: 100 },
  { name: 'tostitos', stock: 100 },
  { name: 'nievecup', stock: 250 },
];

// Item to packaging mapping
const itemPackagingMapping = [
  // Bobas -> 24ozcup
  { itemName: 'Boba Coffee', packaging: '24ozcup' },
  { itemName: 'Boba Strawberry', packaging: '24ozcup' },
  { itemName: 'Boba Taro', packaging: '24ozcup' },

  { itemName: 'BobaTiger Milk', packaging: '24ozcup' },
  { itemName: 'Coffee boba', packaging: '24ozcup' },
  { itemName: 'Tiger Milk', packaging: '24ozcup' },
  
  // Chamoyadas -> 24ozcup
  { itemName: 'Chamoyada de Piña', packaging: '24ozcup' },
  { itemName: 'Chamoyada de Tamarindo', packaging: '24ozcup' },
  { itemName: 'Chamoyada Fresa', packaging: '24ozcup' },
  { itemName: 'Chamoyada Mango', packaging: '24ozcup' },
  { itemName: 'Chamoyada Sandía', packaging: '24ozcup' },
  
  // Drinks -> 24ozcup
  { itemName: 'Coco Rosa', packaging: '24ozcup' },
  { itemName: 'Horchata Canela', packaging: '24ozcup' },
  { itemName: 'Horchata Fresa', packaging: '24ozcup' },
  { itemName: 'Malteada', packaging: '24ozcup' },
  { itemName: 'Mango Peach Dragonfruit', packaging: '24ozcup' },
  { itemName: 'Red Bull Infuser', packaging: '24ozcup' },
  { itemName: 'Strawberry Acai', packaging: '24ozcup' },
  { itemName: 'Taro Hot', packaging: '24ozcup' },
  
  // Frappes -> 20ozcup
  { itemName: 'Cookies and Cream', packaging: '20ozcup' },
  { itemName: 'Frappuchino De Caffe', packaging: '20ozcup' },
  { itemName: 'Frappuchino De Taro', packaging: '20ozcup' },
  
  // Snacks with their own packaging
  { itemName: 'Cheetos', packaging: 'chetos' },
  { itemName: 'Conchitas', packaging: 'conchitas' },
  { itemName: 'Takis', packaging: 'takis' },
  { itemName: 'Tostitos', packaging: 'tostitos' },
  { itemName: 'Sopa', packaging: 'sopas' },
  
  // Crepas -> charolas
  { itemName: 'Crepas', packaging: 'charolas' },
  { itemName: 'Crepa Crispy', packaging: 'charolas' },
  { itemName: 'Elote Entero', packaging: 'charolas' },
  
  // Elotes in cups
  { itemName: 'Elote chico', packaging: 'elote chico' },
  { itemName: 'Elote Grande', packaging: 'elote grande' },
  
  // Fresa con crema
  { itemName: 'Fresa Con Crema 16 oz', packaging: '16ozcupclear' },
  
  // Ice cream
  { itemName: 'Vaso Nieve 1 Scoop', packaging: 'nievecup' },
  { itemName: 'Vaso Nieve 2 Scoops', packaging: 'nievecup' },
  
  // Toppings (no packaging needed)
  { itemName: 'Queso Extra', packaging: null },
  { itemName: 'topping de takis', packaging: null },
  { itemName: 'topping de cheetos', packaging: null },
];

async function main() {
  console.log('Seeding packaging materials...');
  
  // Create packaging materials
  for (const material of packagingMaterials) {
    await prisma.packagingMaterial.upsert({
      where: { name: material.name },
      update: { stock: material.stock },
      create: material,
    });
  }
  
  console.log('Updating items with packaging info...');
  
  // Update items with packaging information
  for (const mapping of itemPackagingMapping) {
    try {
      await prisma.item.update({
        where: { name: mapping.itemName },
        data: { packaging: mapping.packaging },
      });
    } catch (error) {
      console.log(`Item not found: ${mapping.itemName}`);
    }
  }
  
  console.log('Packaging setup complete!');
  console.log(`Seeded ${packagingMaterials.length} packaging materials`);
  console.log(`Updated ${itemPackagingMapping.length} item-packaging mappings`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
