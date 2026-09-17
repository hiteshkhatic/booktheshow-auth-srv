import type { ErrorRequestHandler, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError.js';
import type { ZodIssue } from 'zod';

const sendErrorDev = (err: any, res: Response) => { 
	res.status(err.statusCode || 500).json({
		status: err.status || 'error',
		message: err.message,
		error: err,
		stack: err.stack,
	});
};

const sendErrorProd = (err: any, res: Response) => {
	//1. handler operatinal error (explicitly triggered by our app logic)
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
			...(err.errors && { errors: err.errors })
		});
		return;
	}

	// 2. unhandle programming/infra error (prevent leak data)
	console.error('System Error Log:', err);
	
	res.status(500).json({
		status: 'error',
		message: 'Something went completely wrong on our end',
	});
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	let error = { ...err };
	error.message = err.message;
	error.statusCode = err.statusCode || 500;
	error.status = err.status || 'error';
	error.isOperational = err.isOperational || false;
	error.stack = err.stack;

	// 1. Handle Zod Schema Failures
	if (err instanceof ZodError) {
		error.statusCode = 400;
		error.status = 'fail';
		error.isOperational = true;
		error.message = 'Validation Error';
		// attach details aray so dev vies and inspect it cleanly
		error.errors = err.issues.map((e: ZodIssue) => ({
			field: e.path.join(".") || 'body',
			message: e.message,
		}));


		if (process.env.NODE_ENV === 'production') {
			res.status(400).json({
				status: 'fail',
				message: 'Validation error',
				errors: error.errors,
			});
			return;
		}
	}


	
	// 3. Handle Database Specific Errors 
	if (err.code === '23505') {
		error.statusCode = 409;
		error.status = 'fail';
		error.isOperational = true;
		error.message = 'Duplicate record entry detected.';
	}
	

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(error, res);
	} else {
		sendErrorProd(error, res);
	}
};
