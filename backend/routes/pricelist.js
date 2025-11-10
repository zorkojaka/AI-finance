import { Router } from 'express';
import { listPricelist } from '../models/PricelistItem.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(listPricelist());
});

export default router;
