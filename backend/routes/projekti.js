import { Router } from 'express';
import { Projekt } from '../models/Projekt.js';

const router = Router();

const PROJECT_POPULATE = { path: 'strankaId', select: 'name company email address taxNumber' };

router.get('/', async (req, res, next) => {
  try {
    const projekti = await Projekt.find().sort({ createdAt: -1 }).populate(PROJECT_POPULATE);
    res.json(projekti);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const projekt = await Projekt.findById(req.params.id).populate(PROJECT_POPULATE);
    if (!projekt) {
      return res.status(404).json({ error: 'Projekt ni najden.' });
    }
    res.json(projekt);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = req.body ?? {};
    if (!body.naziv?.trim()) {
      return res.status(400).json({ error: 'Naziv projekta je obvezen.' });
    }
    const projekt = await Projekt.create({
      naziv: body.naziv.trim(),
      strankaId: body.strankaId || null,
      lokacija: body.lokacija ?? '',
      kategorije: Array.isArray(body.kategorije) ? body.kategorije : [],
      zahteve: body.zahteve ?? '',
      status: body.status ?? 'v pripravi'
    });
    const populated = await projekt.populate(PROJECT_POPULATE);
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const body = req.body ?? {};
    if (!body.naziv?.trim()) {
      return res.status(400).json({ error: 'Naziv projekta je obvezen.' });
    }
    const projekt = await Projekt.findByIdAndUpdate(
      req.params.id,
      {
        naziv: body.naziv.trim(),
        strankaId: body.strankaId || null,
        lokacija: body.lokacija ?? '',
        kategorije: Array.isArray(body.kategorije) ? body.kategorije : [],
        zahteve: body.zahteve ?? '',
        status: body.status ?? 'v pripravi'
      },
      { new: true }
    ).populate(PROJECT_POPULATE);

    if (!projekt) {
      return res.status(404).json({ error: 'Projekt ni najden.' });
    }

    res.json(projekt);
  } catch (error) {
    next(error);
  }
});

export default router;
