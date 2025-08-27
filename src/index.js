import express from "express";
import cors from "cors";
import courseRoutes from "./routers/courseRouter.js";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/courses", courseRoutes);

const PORT = 4000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
