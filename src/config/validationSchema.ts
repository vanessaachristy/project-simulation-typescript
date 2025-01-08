
export const validationSchema = {
    login: {
        body: {
            type: 'object',
            properties: {
                user: { type: 'string' },
                password: { type: 'string' }
            },
            required: ['user', 'password']
        }
    },
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
        },

    },

    subscriber: {
        querystring: {
            type: 'object',
            properties: {
                phoneNumber: {
                    type: 'string', pattern: '^(8|9)\\d{7}$',
                },
            },
        },

    },
}