import express from "express";
import type { Express } from "express";
import cors from "cors";

import accountRouter from "./routes/account/account.ts";
import authRouter from "./routes/auth/auth.js";
import eventsRouter from "./routes/events/events.ts";
import paymentsRouter from "./routes/payments/payments.js";
import promosRouter from "./routes/promotions/promotions.ts";
import searchRouter from "./routes/search/search.js";
import tilesRouter from "./routes/tiles/tiles.js";
import venuesRouter from "./routes/venues/venues.ts";
import metaRouter from "./routes/meta/meta.ts";
import locationsRouter from "./routes/locations/locations.ts";

const app: Express = express();
app.use(cors());

const PORT = 3000;

app.use("/account", accountRouter);
app.use("/auth", authRouter);
app.use("/events", eventsRouter);
app.use("/payments", paymentsRouter);
app.use("/promotions", promosRouter);
app.use("/search", searchRouter);
app.use("/tiles", tilesRouter);
app.use("/venues", venuesRouter);
app.use("/meta", metaRouter);
app.use("/locations", locationsRouter);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${3000}`);
});
