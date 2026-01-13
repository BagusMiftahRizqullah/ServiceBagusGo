const swaggerJsdoc = require('swagger-jsdoc')

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Service BagusGo API',
    version: '1.0.0',
    description: 'API dokumentasi untuk Service BagusGo (auth, subscription, dan optimasi rute)'
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Local development'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          phone_number: { type: 'string', example: '6281234567890' },
          trial_start_date: { type: 'string', format: 'date-time', nullable: true },
          trial_end_date: { type: 'string', format: 'date-time', nullable: true },
          subscription_type: {
            type: 'string',
            enum: ['free', 'monthly', 'yearly']
          },
          subscription_start_date: { type: 'string', format: 'date-time', nullable: true },
          subscription_end_date: { type: 'string', format: 'date-time', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      AuthRegisterRequest: {
        type: 'object',
        required: ['phone_number', 'password'],
        properties: {
          phone_number: {
            type: 'string',
            description: 'Nomor HP / WhatsApp',
            example: '+62 812-3456-7890'
          },
          password: {
            type: 'string',
            minLength: 6,
            example: 'secret123'
          }
        }
      },
      AuthLoginRequest: {
        type: 'object',
        required: ['phone_number', 'password'],
        properties: {
          phone_number: { type: 'string', example: '+62 812-3456-7890' },
          password: { type: 'string', example: 'secret123' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          token: { type: 'string', description: 'JWT access token' },
          user: { $ref: '#/components/schemas/User' }
        }
      },
      SubscriptionMeResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          data: { $ref: '#/components/schemas/User' }
        }
      },
      SubscribeRequest: {
        type: 'object',
        required: ['subscription_type'],
        properties: {
          subscription_type: {
            type: 'string',
            enum: ['monthly', 'yearly'],
            example: 'monthly'
          }
        }
      },
      OptimizeRouteRequest: {
        type: 'object',
        required: ['origin', 'destinations'],
        properties: {
          origin: {
            type: 'object',
            required: ['lat', 'lng'],
            properties: {
              lat: { type: 'number', example: -6.200000 },
              lng: { type: 'number', example: 106.816666 }
            }
          },
          destinations: {
            type: 'array',
            minItems: 2,
            items: {
              type: 'string',
              example: 'Jl. Sudirman Jakarta'
            }
          }
        }
      },
      OptimizeRouteItem: {
        type: 'object',
        properties: {
          address: { type: 'string', example: 'Jl. Sudirman Jakarta' },
          distance_km: { type: 'number', example: 3.2 },
          duration: { type: 'string', example: '10 mins' }
        }
      },
      OptimizeRouteResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/OptimizeRouteItem' }
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string', example: 'Error message' }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'Service OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrasi dengan nomor HP / WhatsApp',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthRegisterRequest' }
            }
          }
        },
        responses: {
          201: {
            description: 'Registrasi berhasil',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          400: {
            description: 'Validasi gagal',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          409: {
            description: 'Nomor sudah terdaftar',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login dengan nomor HP dan password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthLoginRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Login berhasil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    token: { type: 'string' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Validasi gagal',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          401: {
            description: 'Kredensial salah',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/subscription/me': {
      get: {
        tags: ['Subscription'],
        summary: 'Lihat informasi trial dan subscription user saat ini',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Informasi subscription',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SubscriptionMeResponse' }
              }
            }
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/subscription/subscribe': {
      post: {
        tags: ['Subscription'],
        summary: 'Aktivasi paket subscription (monthly / yearly)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SubscribeRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Subscription berhasil diupdate',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SubscriptionMeResponse' }
              }
            }
          },
          400: {
            description: 'Validasi gagal',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/optimize-route': {
      post: {
        tags: ['Route Optimization'],
        summary: 'Optimasi rute dari 1 origin ke banyak tujuan',
        description:
          'Menggunakan Google Geocoding + Distance Matrix untuk menghitung jarak dan estimasi durasi, lalu mengurutkan dari yang terdekat.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OptimizeRouteRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Daftar tujuan terurut dari yang terdekat',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/OptimizeRouteResponse' }
              }
            }
          },
          400: {
            description: 'Validasi gagal atau geocoding gagal',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          403: {
            description: 'Trial/subscription tidak aktif',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    }
  }
}

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: []
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

module.exports = { swaggerSpec }

