import Joi from 'joi';

export const orderSchema = Joi.object({
    items: Joi.array().items(Joi.object({
        product: Joi.string().hex().length(24).required(),
        quantity: Joi.number().min(1).required(),
        size: Joi.string().required(),
        color: Joi.string().required()
    })).required(),
    totalAmount: Joi.number().required(),
    address: Joi.string().required(),
    paymentMethod: Joi.string().valid("cod", "online").required()
});
