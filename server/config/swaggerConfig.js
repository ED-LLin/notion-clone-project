const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Notion-Clone-Project API docs',
        version: '1.0.0',
        description: '這是 Notion-Clone-Project 的 API 文件，提供了使用者認證、筆記管理和搜尋功能的詳細說明。',
      },
      servers: [
        {
          url: 'http://localhost:3000',
        },
      ],
    },
    apis: ['./server/routes/*.js', './server/controllers/*.js'], // Added controllers folder
  };

  module.exports = swaggerOptions;