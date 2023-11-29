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
 *     summary: List all collections federated by the Open Terms Archive core team.
 *     tags: [Collections]
 *     responses:
 *       '200':
 *         description: A JSON array of all federated collections.
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
 *                     format: url
 *                     description: The URL at which the API of that collection can be queried.
 */
router.get('/collections', getCollections);

export default router;
