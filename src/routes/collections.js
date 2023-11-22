import express from 'express';

import { getCollections } from '../controllers/collections.js';

/**
 * @swagger
 * tags:
 *   name: Collections
 *   description: Collections API
 */
const router = express.Router();

/**
 * @swagger
 * /collections:
 *   get:
 *     summary: Enumerate all collections.
 *     tags: [Collections]
 *     responses:
 *       '200':
 *         description: A JSON array of all collections.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The ID of the collection.
 *                   name:
 *                     type: string
 *                     description: The name of the collection.
 *                   endpoint:
 *                     type: string
 *                     description: The URL for the collection endpoint.
 */
router.get('/collections', getCollections);

export default router;
