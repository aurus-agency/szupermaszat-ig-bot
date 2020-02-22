// sonar-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'sonar';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    id : { type: Number, required: true },
    username: { type: String, required: true },
    fullName: { type: String, required: true },
    isPrivate: { type: Boolean, required: true },
    timestamp: { type: Number, required: true },
    following: { type: Boolean, required: true },
    closed: { type: Boolean, required: true },
  }, {
    timestamps: true,
    collection: 'sonar',
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
  
};
