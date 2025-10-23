import express from "express";
import sqlite3 from "sqlite3";
import path from "path";
import zlib from "zlib";

const router = express.Router();

const dbPath = path.resolve("data/tiles/map_tiles.mbtiles");
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

router.get("/:z/:x/:y.pbf", (req, res) => {
  const { x, y, z } = req.params;

  console.log(`X: ${x} Y: ${y} Z: ${z}`);

  const query =
    "SELECT tile_data FROM tiles WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?";

  const convertedY = 2 ** z - 1 - y;

  db.get(query, [z, x, convertedY], (err, row) => {
    if (err) {
      console.error("SQLite error:", err);
      return res.status(500).send("Internal server error");
    }

    if (!row) {
      return res.status(404).send("Tile not found");
    }

    const decompressed = zlib.gunzipSync(row.tile_data);
    res.setHeader("Content-Type", "application/x-protobuf");
    res.send(decompressed);
  });
});

export default router;
