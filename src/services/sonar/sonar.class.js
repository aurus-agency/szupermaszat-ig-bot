const { Service } = require('feathers-mongoose');

exports.Sonar = class Sonar extends Service {
  
  async lol() {
    const bug = await this.find();
    return bug;
  }
};
