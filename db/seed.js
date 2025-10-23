import { PrismaClient } from "@prisma/client";
import locations from "../mock_data/locations/locations.json" with { type: "json" };

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Database...");

  for (const loc of locations) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Location" (geom)
      VALUES (ST_SetSRID(ST_MakePoint(${loc.lng}, ${loc.lat}), 4326));
    `);
  }

  console.log("Seeding complete")
}

main()
  .catch((e) => {
    console.log(e), process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
