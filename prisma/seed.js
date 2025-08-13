import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Seed items with correct pricing and items
const items = [
  // SNACKS (should be first category)
  { name: 'Elote chico', category: 'SNACKS', priceCents: 499 },
  { name: 'Elote Grande', category: 'SNACKS', priceCents: 699 },
  { name: 'Elote Entero', category: 'SNACKS', priceCents: 499 },
  { name: 'Takis', category: 'SNACKS', priceCents: 699 },
  { name: 'Cheetos', category: 'SNACKS', priceCents: 699 },
  { name: 'Conchitas', category: 'SNACKS', priceCents: 699 },
  { name: 'Tostitos', category: 'SNACKS', priceCents: 699 },
  { name: 'Crepas', category: 'SNACKS', priceCents: 799 },
  { name: 'Fresa Con Crema 16 oz', category: 'SNACKS', priceCents: 699 },
  { name: 'Sopa', category: 'SNACKS', priceCents: 499 },
  { name: 'Vaso Nieve 1 Scoop', category: 'SNACKS', priceCents: 249 },
  { name: 'Vaso Nieve 2 Scoops', category: 'SNACKS', priceCents: 499 },
  { name: 'Queso Extra', category: 'SNACKS', priceCents: 25 },

  // Chamoyadas (light yellow background)
  { name: 'Chamoyada de Tamarindo', category: 'Chamoyadas', priceCents: 700 },
  { name: 'Chamoyada Fresa', category: 'Chamoyadas', priceCents: 700 },
  { name: 'Chamoyada Mango', category: 'Chamoyadas', priceCents: 700 },
  { name: 'Chamoyada Sandía', category: 'Chamoyadas', priceCents: 700 },

  // Drinks (light blue background) - $4.99
  { name: 'Coco Rosa', category: 'Drinks', priceCents: 499 },
  { name: 'Horchata Canela', category: 'Drinks', priceCents: 499 },
  { name: 'Horchata Fresa', category: 'Drinks', priceCents: 499 },
  { name: 'Mango Peach Dragonfruit', category: 'Drinks', priceCents: 499 },
  { name: 'Red Bull Preparado', category: 'Drinks', priceCents: 499 },
  { name: 'Strawberry Acai', category: 'Drinks', priceCents: 499 },
  { name: 'Taro', category: 'Drinks', priceCents: 500 },

  // Frappes (light brown background)
  { name: 'Cookies and Cream', category: 'Frappes', priceCents: 699 },
  { name: 'Caramel Frappuccino', category: 'Frappes', priceCents: 699 },
  { name: 'Frappuchino De Taro', category: 'Frappes', priceCents: 699 },
  { name: 'Malteada', category: 'Frappes', priceCents: 699 },

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


