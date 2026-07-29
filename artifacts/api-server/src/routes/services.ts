import { Router, type IRouter } from "express";
import { db, servicesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/services", async (req, res): Promise<void> => {
  const services = await db.select().from(servicesTable).orderBy(servicesTable.id);
  res.json(services);
});

export default router;
