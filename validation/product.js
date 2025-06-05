import Joi from 'joi';

export const productSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).required(),
    price: Joi.number().min(0).required(),
    sizes: Joi.array().items(Joi.string().valid('S', 'M', 'L', 'XL')).required(),
    colors: Joi.array().items(Joi.string()).required(),
    images: Joi.array().items(Joi.string().uri()).required(),
    stock: Joi.number().integer().min(0).default(0),
    category: Joi.string().default('nightsuit'),
    material: Joi.string().optional(),
    rating: Joi.number().min(0).max(5).default(0),
    reviews: Joi.array().items(
        Joi.object({
            user: Joi.string().hex().length(24), // MongoDB ObjectId format
            comment: Joi.string(),
            rating: Joi.number().min(0).max(5),
        })
    ).optional()
});
