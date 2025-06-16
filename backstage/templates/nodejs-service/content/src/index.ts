import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
{% if values.include_swagger %}
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
{% endif %}
{% if values.include_monitoring %}
import promClient from 'prom-client';
{% endif %}
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
{% if values.include_auth %}
import authRoutes from './routes/auth';
{% endif %}
import userRoutes from './routes/users';
import healthRoutes from './routes/health';
{% if values.include_monitoring %}
import metricsRoutes from './routes/metrics';
{% endif %}
{% if values.include_database %}
import { prisma } from './config/database';
{% endif %}

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || ${{ values.port }};

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

{% if values.include_monitoring %}
// Metrics collection
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

// Custom metrics
export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Middleware to collect metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });
  
  next();
});
{% endif %}

{% if values.include_swagger %}
// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
{% endif %}

// Routes
{% if values.include_auth %}
app.use('/api/auth', authRoutes);
{% endif %}
app.use('/api/users', userRoutes);
app.use('/health', healthRoutes);
{% if values.include_monitoring %}
app.use('/metrics', metricsRoutes);
{% endif %}

// Root route
app.get('/', (req, res) => {
  res.json({
    name: '${{ values.name }}',
    description: '${{ values.description }}',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    {% if values.include_swagger %}
    documentation: '/api-docs',
    {% endif %}
    endpoints: {
      health: '/health',
      {% if values.include_monitoring %}
      metrics: '/metrics',
      {% endif %}
      {% if values.include_auth %}
      auth: '/api/auth',
      {% endif %}
      users: '/api/users'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing server...');
  
  {% if values.include_database %}
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
  {% endif %}
  
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
  {% if values.include_monitoring %}
  logger.info(`📊 Metrics: http://localhost:${PORT}/metrics`);
  {% endif %}
});

export default app;
