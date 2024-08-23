const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Notion-Clone-Project API docs',
        version: '1.0.0',
        description: 'This is the API documentation for the Notion-Clone-Project, providing detailed information on user authentication, note management, adding new notes, and fetching community content.',
      },
      servers: [
        {
          url: 'http://notion-clone.com',
        },
      ],
    },
    apis: ['./server/routes/*.js', './server/controllers/*.js'], 
  };

  module.exports = swaggerOptions;