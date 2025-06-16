import { Router } from 'express';
{% if values.include_database %}
import { prisma } from '../config/database';
{% endif %}

const router = Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      checks: {
        {% if values.include_database %}
        database: 'unknown',
        {% endif %}
        memory: 'unknown',
        disk: 'unknown'
      }
    };

    // Memory check
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };
    
    healthCheck.checks.memory = memUsageMB.heapUsed < 500 ? 'ok' : 'warning';

    {% if values.include_database %}
    // Database check
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthCheck.checks.database = 'ok';
    } catch (error) {
      healthCheck.checks.database = 'error';
      healthCheck.status = 'unhealthy';
    }
    {% endif %}

    // Overall status
    const hasErrors = Object.values(healthCheck.checks).includes('error');
    if (hasErrors) {
      healthCheck.status = 'unhealthy';
      return res.status(503).json(healthCheck);
    }

    res.json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Readiness probe
router.get('/ready', async (req, res) => {
  try {
    {% if values.include_database %}
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    {% endif %}
    
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Service dependencies not available'
    });
  }
});

// Liveness probe
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
