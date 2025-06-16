import { Router } from 'express';
import { z } from 'zod';
{% if values.include_database %}
import { prisma } from '../config/database';
{% endif %}
{% if values.include_auth %}
import { authenticateToken } from '../middleware/auth';
{% endif %}
import { validateRequest } from '../middleware/validation';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    age: z.number().int().min(1).max(150).optional()
  })
});

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    age: z.number().int().min(1).max(150).optional()
  }),
  params: z.object({
    id: z.string().uuid('Valid UUID is required')
  })
});

const getUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid UUID is required')
  })
});

// Mock data for when database is not included
{% if not values.include_database %}
interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}

let mockUsers: User[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 30,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
{% endif %}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         age:
 *           type: integer
 *           minimum: 1
 *           maximum: 150
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */
{% if values.include_auth %}router.get('/', authenticateToken, async (req, res) => {{% else %}router.get('/', async (req, res) => {{% endif %}
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    {% if values.include_database %}
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count()
    ]);
    {% else %}
    const total = mockUsers.length;
    const users = mockUsers.slice(skip, skip + limit);
    {% endif %}

    res.json({
      users,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               age:
 *                 type: integer
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
{% if values.include_auth %}router.post('/', authenticateToken, validateRequest(createUserSchema), async (req, res) => {{% else %}router.post('/', validateRequest(createUserSchema), async (req, res) => {{% endif %}
  try {
    const { name, email, age } = req.body;

    {% if values.include_database %}
    const user = await prisma.user.create({
      data: {
        name,
        email,
        age
      }
    });
    {% else %}
    const user = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      age,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockUsers.push(user);
    {% endif %}

    logger.info(`User created: ${user.id}`);
    res.status(201).json(user);
  } catch (error) {
    logger.error('Error creating user:', error);
    {% if values.include_database %}
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    {% endif %}
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
{% if values.include_auth %}router.get('/:id', authenticateToken, validateRequest(getUserSchema), async (req, res) => {{% else %}router.get('/:id', validateRequest(getUserSchema), async (req, res) => {{% endif %}
  try {
    const { id } = req.params;

    {% if values.include_database %}
    const user = await prisma.user.findUnique({
      where: { id }
    });
    {% else %}
    const user = mockUsers.find(u => u.id === id);
    {% endif %}

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               age:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
{% if values.include_auth %}router.put('/:id', authenticateToken, validateRequest(updateUserSchema), async (req, res) => {{% else %}router.put('/:id', validateRequest(updateUserSchema), async (req, res) => {{% endif %}
  try {
    const { id } = req.params;
    const updateData = req.body;

    {% if values.include_database %}
    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });
    {% else %}
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updateData,
      updatedAt: new Date()
    };
    const user = mockUsers[userIndex];
    {% endif %}

    logger.info(`User updated: ${user.id}`);
    res.json(user);
  } catch (error) {
    logger.error('Error updating user:', error);
    {% if values.include_database %}
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    {% endif %}
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
{% if values.include_auth %}router.delete('/:id', authenticateToken, validateRequest(getUserSchema), async (req, res) => {{% else %}router.delete('/:id', validateRequest(getUserSchema), async (req, res) => {{% endif %}
  try {
    const { id } = req.params;

    {% if values.include_database %}
    await prisma.user.delete({
      where: { id }
    });
    {% else %}
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    mockUsers.splice(userIndex, 1);
    {% endif %}

    logger.info(`User deleted: ${id}`);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting user:', error);
    {% if values.include_database %}
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    {% endif %}
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
