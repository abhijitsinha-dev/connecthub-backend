import Joi from 'joi';

const customJoi = Joi.defaults(schema =>
  schema.options({
    // By default, Joi aborts validation on the first error. Setting abortEarly to false allows us to collect all validation errors and return them together.
    abortEarly: false,
    // By default, Joi allows unknown keys that are not specified in the schema. Setting stripUnknown to true ensures that any keys not defined in the schema are automatically removed from the validated data, preventing unexpected or malicious data from being processed.
    stripUnknown: true,
    // By default, Joi wraps error messages in quotes and includes the label of the field. Setting wrap.label to false prevents Joi from adding quotes around the field names in error messages, resulting in cleaner and more readable error messages.
    errors: {
      wrap: {
        label: false,
      },
    },
  })
);

export { customJoi };
