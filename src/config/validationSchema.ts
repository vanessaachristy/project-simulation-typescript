
export const validationSchema = {
    billing: {
        querystring: {
            type: 'object',
            properties: {
                phoneNumber: {
                    type: 'string', pattern: '^(8|9)\\d{7}$',
                },
                days: { type: 'number', minimum: 0 },
            },
            required: ['phoneNumber'],
            errorMessages: {
                properties: {
                    phoneNumber: "phoneNumber should be a valid Singapore phone number format: (8/9)XXXXXXXX",
                    startDate: "startDate should be in YYYY-MM-DD format",
                    endDate: "endDate should be in YYYY-MM-DD format",
                },
            },
        },

    },
    usage: {
        querystring: {
            type: 'object',
            properties: {
                phoneNumber: {
                    type: 'string', pattern: '^(8|9)\\d{7}$'
                },
                startDate: {
                    type: 'string', pattern: '^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$'
                },
                endDate: {
                    type: 'string', pattern: '^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$'
                },
            },
            required: ['phoneNumber'],
        },

    },

    subscriber: {
        querystring: {
            type: 'object',
            properties: {
                phoneNumber: {
                    type: 'string', pattern: '^(8|9)\\d{7}$',
                },
                days: { type: 'number', minimum: 0 },
            },
            required: ['phoneNumber'],
        },

    },
}