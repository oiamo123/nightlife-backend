import express from "express";
import cors from "cors";

// ROUTES
import accountRouter from "./src/routes/account/account.js";
import authRouter from "./src/routes/auth/auth.js";
import eventsRouter from "./src/routes/events/events.js";
import locationsRouter from "./src/routes/locations/locations.js";
import paymentsRouter from "./src/routes/payments/payments.js";
import promosRouter from "./src/routes/promotions/promotions.js";
import searchRouter from "./src/routes/search/search.js";
import tilesRouter from "./src/routes/tiles/tiles.js";
import venuesRouter from "./src/routes/venues/venues.js";
import { PrismaClient } from "@prisma/client";

const app = express();
app.use(cors());

const PORT = 3000;

app.use("/account", accountRouter);
app.use("/auth", authRouter);
app.use("/events", eventsRouter);
app.use("/locations", locationsRouter);
app.use("/payments", paymentsRouter);
app.use("/promotions", promosRouter);
app.use("/search", searchRouter);
app.use("/tiles", tilesRouter);
app.use("/venues", venuesRouter);

const prisma = new PrismaClient();

app.get("/", async (req, res) => {
  const data = await prisma.location.findMany();
  console.log(data);

  res.send("blah");
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${3000}`);
});
