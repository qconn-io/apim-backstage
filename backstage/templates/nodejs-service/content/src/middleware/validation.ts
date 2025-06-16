import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { logger } from '../utils/logger';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        logger.warn('Validation error:', {
          url: req.originalUrl,
          method: req.method,
          errors: errorMessages,
          body: req.body,
          query: req.query,
          params: req.params
        });

        return res.status(400).json({
          error: 'Validation failed',
          details: errorMessages,
          timestamp: new Date().toISOString()
        });
      }

      // If not a validation error, pass to error handler
      next(error);
    }
  };
};
