import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Seed items with correct pricing - Bobas and Drinks are $4.99 (499 cents)
const items = [
  // SNACKS (should be first category)
  { name: 'Elote chico', category: 'SNACKS', priceCents: 500 },
  { name: 'Elote Grande', category: 'SNACKS', priceCents: 700 },
  { name: 'Elote Entero', category: 'SNACKS', priceCents: 600 },
  { name: 'Takis', category: 'SNACKS', priceCents: 700 },
  { name: 'Cheetos', category: 'SNACKS', priceCents: 700 },
  { name: 'Conchitas', category: 'SNACKS', priceCents: 700 },
  { name: 'Tostitos', category: 'SNACKS', priceCents: 700 },
  { name: 'Crepa Crispy', category: 'SNACKS', priceCents: 800 },
  { name: 'Crepas', category: 'SNACKS', priceCents: 800 },
  { name: 'Fresa Con Crema 16 oz', category: 'SNACKS', priceCents: 700 },
  { name: 'Sopa', category: 'SNACKS', priceCents: 500 },
  { name: 'Vaso Nieve 1 Scoop', category: 'SNACKS', priceCents: 250 },
  { name: 'Vaso Nieve 2 Scoops', category: 'SNACKS', priceCents: 500 },
  { name: 'Queso Extra', category: 'SNACKS', priceCents: 25 },
  { name: 'topping de takis', category: 'SNACKS', priceCents: 100 },
  { name: 'topping de cheetos', category: 'SNACKS', priceCents: 100 },

  // Chamoyadas (light yellow background)
  { name: 'Chamoyada de Piña', category: 'Chamoyadas', priceCents: 700 },
  { name: 'Chamoyada de Tamarindo', category: 'Chamoyadas', priceCents: 700 },
  { name: 'Chamoyada Fresa', category: 'Chamoyadas', priceCents: 700 },
  { name: 'Chamoyada Mango', category: 'Chamoyadas', priceCents: 700 },
  { name: 'Chamoyada Sandía', category: 'Chamoyadas', priceCents: 700 },

  // Drinks (light blue background) - $4.99
  { name: 'Coco Rosa', category: 'Drinks', priceCents: 499 },
  { name: 'Horchata Canela', category: 'Drinks', priceCents: 499 },
  { name: 'Horchata Fresa', category: 'Drinks', priceCents: 499 },
  { name: 'Mango Peach Dragonfruit', category: 'Drinks', priceCents: 499 },
  { name: 'Red Bull Infuser', category: 'Drinks', priceCents: 499 },
  { name: 'Strawberry Acai', category: 'Drinks', priceCents: 499 },
  { name: 'Taro Hot', category: 'Drinks', priceCents: 500 },
  { name: 'Malteada', category: 'Drinks', priceCents: 699 },

  // Frappes (light brown background)
  { name: 'Cookies and Cream', category: 'Frappes', priceCents: 699 },
  { name: 'Frappuchino De Caffe', category: 'Frappes', priceCents: 699 },
  { name: 'Frappuchino De Taro', category: 'Frappes', priceCents: 699 },

  // Bobas (light pink background) - $4.99
  { name: 'Boba Coffee', category: 'Bobas', priceCents: 499 },
  { name: 'Boba Strawberry', category: 'Bobas', priceCents: 499 },
  { name: 'Boba Taro', category: 'Bobas', priceCents: 499 },
  { name: 'BobaTiger Milk', category: 'Bobas', priceCents: 499 },
  { name: 'Coffee boba', category: 'Bobas', priceCents: 499 },
  { name: 'Tiger Milk', category: 'Bobas', priceCents: 499 },
];

async function main() {
  for (const item of items) {
    await prisma.item.upsert({
      where: { name: item.name },
      update: item,
      create: { ...item, stock: 100 },
    });
  }
  console.log('Seeded items:', items.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


