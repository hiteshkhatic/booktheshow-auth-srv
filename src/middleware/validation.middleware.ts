import type { RequestHandler } from "express"
import type{ ZodType, z } from "zod";

type ZodTypeAny = ZodType<any, any, any>;

interface ValidationTarget<B extends ZodTypeAny, Q extends ZodTypeAny, P extends ZodTypeAny> {
    body?: B;
    query?: Q;
    params?: P;
}

export const validateRequest = <
    B extends ZodTypeAny = ZodTypeAny,
    Q extends ZodTypeAny = ZodTypeAny,
    P extends ZodTypeAny = ZodTypeAny
>(
    schemas: ValidationTarget<B, Q, P>
): RequestHandler<
P extends ZodTypeAny ? z.infer<P> : any,
any,
B extends ZodTypeAny ? z.infer<B> : any,
Q extends ZodTypeAny ? z.infer<Q> : any 
> => {
    return async (req , res, next): Promise<void> => {
        try {
            if (schemas.params) (req as any).params = await schemas.params.parseAsync(req.params);
            if (schemas.query) (req as any).query = await schemas.query.parseAsync(req.query);
            if (schemas.body) (req as any).body = await schemas.body.parseAsync(req.body);
            next();
        } catch (error: any) {
            res.status(400).json({
                status: 'fail',
                message: 'validation error',
                errors: error.errors?.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })) || error.message,
            });
        }
    };
};

