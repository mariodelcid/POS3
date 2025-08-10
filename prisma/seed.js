import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Seed items from the provided screenshots (best-effort list; you can adjust later)
const items = [
  { name: 'Boba Coffee', category: 'Bobas', priceCents: 500 },
  { name: 'Boba Strawberry', category: 'Bobas', priceCents: 500 },
  { name: 'Boba Taro', category: 'Bobas', priceCents: 500 },

  { name: 'BobaTiger Milk', category: 'Bobas', priceCents: 500 },
  { name: 'Chamoyada de Piña', category: 'Chamoyadas', priceCents: 700 },
  { name: 'Chamoyada de Tamarindo', category: 'Chamoyadas', priceCents: 700 },
  { name: 'Chamoyada Fresa', category: 'Chamoyadas', priceCents: 700 },
  { name: 'Chamoyada Mango', category: 'Chamoyadas', priceCents: 700 },
  { name: 'Chamoyada Sandía', category: 'Chamoyadas', priceCents: 700 },
  { name: 'Cheetos', category: 'SNACKS', priceCents: 700 },
  { name: 'Coco Rosa', category: 'DRINKS', priceCents: 499 },
  { name: 'Coffee boba', category: 'Bobas', priceCents: 600 },
  { name: 'Conchitas', category: 'SNACKS', priceCents: 700 },
  { name: 'Cookies and Cream', category: 'Frappes', priceCents: 699 },
  { name: 'Crepa Crispy', category: 'SNACKS', priceCents: 800 },
  { name: 'Crepas', category: 'SNACKS', priceCents: 800 },
  { name: 'Elote chico', category: 'SNACKS', priceCents: 500 },
  { name: 'Elote Entero', category: 'SNACKS', priceCents: 600 },
  { name: 'Elote Grande', category: 'SNACKS', priceCents: 700 },
  { name: 'Frappuchino De Caffe', category: 'Frappes', priceCents: 699 },
  { name: 'Frappuchino De Taro', category: 'Frappes', priceCents: 699 },
  { name: 'Fresa Con Crema 16 oz', category: 'SNACKS', priceCents: 700 },
  { name: 'Horchata Canela', category: 'DRINKS', priceCents: 499 },
  { name: 'Horchata Fresa', category: 'DRINKS', priceCents: 499 },
  { name: 'Malteada', category: 'DRINKS', priceCents: 699 },
  { name: 'Mango Peach Dragonfruit', category: 'DRINKS', priceCents: 499 },
  { name: 'Queso Extra', category: 'SNACKS', priceCents: 25 },
  { name: 'Red Bull Infuser', category: 'DRINKS', priceCents: 499 },
  { name: 'Sopa', category: 'SNACKS', priceCents: 500 },
  { name: 'Strawberry Acai', category: 'DRINKS', priceCents: 499 },
  { name: 'Takis', category: 'SNACKS', priceCents: 700 },
  { name: 'Taro Hot', category: 'DRINKS', priceCents: 500 },
  { name: 'Tiger Milk', category: 'Bobas', priceCents: 600 },
  { name: 'topping de takis', category: 'SNACKS', priceCents: 100 },
  { name: 'topping de cheetos', category: 'SNACKS', priceCents: 100 },
  { name: 'Tostitos', category: 'SNACKS', priceCents: 700 },
  { name: 'Vaso Nieve 1 Scoop', category: 'SNACKS', priceCents: 250 },
  { name: 'Vaso Nieve 2 Scoops', category: 'SNACKS', priceCents: 500 },
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


