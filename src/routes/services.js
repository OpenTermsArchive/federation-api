import express from 'express';

import { getServices, getService } from '../controllers/services.js';

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Services API
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       description: Definition of a service and the agreements its provider sets forth. While the information is the same, the format differs from the JSON declaration files that are designed for readability by contributors.
 *       properties:
 *         id:
 *           type: string
 *           description: The ID of the service.
 *         name:
 *           type: string
 *           description: The name of the service.
 *         url:
 *           type: string
 *           description: The URL where the service can be found.
 *         termsTypes:
 *           type: array
 *           description: The declared terms types for this service.
 *           items:
 *             type: string
 *             description: The type of terms.
 */
const router = express.Router();

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Get matching services based on name and termsTypes query params.
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: The string to search for in service names.
 *       - in: query
 *         name: termsTypes
 *         schema:
 *           type: string
 *         description: The parameter for specifying desired term types in the search. This parameter can be specified multiple times, all provided values will be used in the search.
 *     tags: [Services]
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: A JSON object containing a results array of matching services and a failures array. If no parameters are passed, it returns all services in the results array; otherwise, it returns an empty array if no matching service is found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                    type: object
 *                    properties:
 *                      collection:
 *                        type: string
 *                        description: The id of the collection.
 *                      service:
 *                        $ref: '#/components/schemas/Service'
 *                 failures:
 *                   type: array
 *                   items:
 *                    type: object
 *                    properties:
 *                      collection:
 *                        type: string
 *                        description: The id of the collection.
 *                      message:
 *                        type: string
 *                        description: An explanation of the failure.
 */
router.get('/services', getServices);

/**
 * @swagger
 * /service/{serviceId}:
 *   get:
 *     summary: Retrieve specific services identified by the given ID across all collections.
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the service.
 *     responses:
 *       200:
 *         description: A JSON object containing a results array of the specific service identified by the given ID across all collections and a failures array.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                    type: object
 *                    properties:
 *                      collection:
 *                        type: string
 *                        description: The id of the collection.
 *                      service:
 *                        $ref: '#/components/schemas/Service'
 *                 failures:
 *                   type: array
 *                   items:
 *                    type: object
 *                    properties:
 *                      collection:
 *                        type: string
 *                        description: The id of the collection.
 *                      message:
 *                        type: string
 *                        description: An explanation of the failure.
 */
router.get('/service/:serviceId', getService);

export default router;
