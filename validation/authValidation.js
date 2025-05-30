import Joi from 'joi';

export const CreateStaffSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(3).required(),
    role: Joi.string().valid('admin', 'receptionist', 'department', 'beneficiary').required(),
    cnic: Joi.string().length(13).pattern(/^[0-9]+$/).required().messages({
        'string.base': 'CNIC must be a string.',
        'string.length': 'CNIC must be exactly 13 digits.',
        'string.pattern.base': 'CNIC must contain only numbers.',
        'any.required': 'CNIC is required.'
    })

});

export const signupSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(3).required(),
    cnic: Joi.string().length(13).pattern(/^[0-9]+$/).required().messages({
        'string.base': 'CNIC must be a string.',
        'string.length': 'CNIC must be exactly 13 digits.',
        'string.pattern.base': 'CNIC must contain only numbers.',
        'any.required': 'CNIC is required.'
    })
});


export const loginSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string().min(6).required(),
});