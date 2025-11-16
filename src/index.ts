import express from "express";
import type { Express } from "express";
import cors from "cors";

import authRouter from "./routes/auth/auth.ts";
import eventsRouter from "./routes/events/events.ts";
import paymentsRouter from "./routes/payments/payments.js";
import performersRouter from "./routes/performers/performers.ts";
import promotionsRouter from "./routes/promotions/promotions.ts";
import searchRouter from "./routes/search/search.js";
import tilesRouter from "./routes/tiles/tiles.js";
import userRouter from "./routes/user/user.ts";
import venuesRouter from "./routes/venues/venues.ts";
import metaRouter from "./routes/meta/meta.ts";
import locationsRouter from "./routes/locations/locations.ts";
import discoverRouter from "./routes/discover/discovery.ts";

const app: Express = express();
app.use(express.json());
app.use(cors());

const PORT = 3000;

app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/events", eventsRouter);
app.use("/payments", paymentsRouter);
app.use("/performers", performersRouter);
app.use("/promotions", promotionsRouter);
app.use("/search", searchRouter);
app.use("/tiles", tilesRouter);
app.use("/venues", venuesRouter);
app.use("/meta", metaRouter);
app.use("/locations", locationsRouter);
app.use("/discover", discoverRouter);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${3000}`);
});
