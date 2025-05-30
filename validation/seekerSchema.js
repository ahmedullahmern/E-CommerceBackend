import Joi from "joi";

export const seekerRegisterSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),

    // password: Joi.string().min(6).required(),

    name: Joi.string().min(3).required(),

    cnic: Joi.string().length(13).pattern(/^[0-9]+$/).required().messages({
        'string.base': 'CNIC must be a string.',
        'string.length': 'CNIC must be exactly 13 digits.',
        'string.pattern.base': 'CNIC must contain only numbers.',
        'any.required': 'CNIC is required.'
    }),

    phone: Joi.string().required().messages({
        'string.base': 'Phone number must be a string.',
        'any.required': 'Phone number is required.'
    }),

    address: Joi.string().required().messages({
        'string.base': 'Address must be a string.',
        'any.required': 'Address is required.'
    }),

    purpose: Joi.string().required().messages({
        'string.base': 'Purpose must be a string.',
        'any.required': 'Purpose is required.'
    })
});
// });
