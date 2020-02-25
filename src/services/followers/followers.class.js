/* eslint-disable no-unused-vars */
const moment = require('moment');

exports.Followers = class Followers {
  constructor (options, app) {
    this.options = options || {};
    this.app = app;
  }

  async sendFollow(user) {
    const client = await this.app.service('core').client();
    await client.entity.profile(user.id).checkFollow();
  }

  async sendUnfollow(user) {
    const client = await this.app.service('core').client();
    await client.entity.profile(user.id).checkUnfollow();
  }

  async getFollowers() {
    const client = await this.app.service('core').client();
    const account = await this.app.service('core').account();
    console.log('Getting list of followers...');
    const followers = await client.feed.accountFollowers(account.pk);
    let items = [];
    let users = [];
    do {
      items.push(await followers.items());
    } while(followers.isMoreAvailable());
    items.forEach((outer) => {
      outer.forEach((inner) => {
        users.push(inner);
      });
    });
    return users;
  }

  async searchForUsersToFollow() {
    console.log('Getting users from the sonar collection...');
    const usersToFollow = await this.app.service('sonar').find({
      paginate: false,
      query: {
        isPrivate: false,
        following: false
      }
    });
    console.log('Total results from database: ' + usersToFollow.length);
    console.log('Getting the first user from the list...');
    console.log('#############################################');
    console.log('The first user on the list');
    console.log('#############################################');
    console.log(usersToFollow[0]);
    console.log(usersToFollow[0].fullName + ',' + usersToFollow[0].username);
    const now = moment().unix();
    try {
      console.log('Sending follow to: ' + usersToFollow[0].fullName + ',' + usersToFollow[0].username);
      await this.sendFollow(usersToFollow[0]);
      await this.app.service('sonar').patch(usersToFollow[0]._id, {
        following: true,
        closed: false,
        timestamp: now,
      });
    } catch (e) {
      console.error(e);
      await this.app.service('sonar').patch(usersToFollow[0]._id, {
        following: true,
        closed: false,
        timestamp: now,
      });
      // errors.follow.error = true;
      // errors.follow.message = e;
      /* await updateDocument(dbUsers[0]._id, {
        following: true,
        closed: true,
        timestamp: now,
      }, 'sonar'); */
      // throw new Error('There was an error sending follow to user: ' + usersToFollow[0].name);
    }
    // console.log('Waiting 30seconds before going to the next task');
    // await sleep();
    return 'Done';
  }

  async searchForUsersToUnfollow() {
    console.log('Getting users from the sonar collection...');
    const usersToUnfollow = await this.app.service('sonar').find({
      paginate: false,
      query: {
        isPrivate: false,
        following: true,
        closed: false
      }
    });
    console.log('Total results from database: ' + usersToUnfollow.length);
    console.log('#############################################');
    console.log('The following users should be unfollowed ');
    console.log('#############################################');
    usersToUnfollow.forEach((user) => {
      console.log(user.fullName, '(' + user.id, user.username + ')');
    });
    const now = moment().unix();
    const convertToDate = moment.unix(usersToUnfollow[0].timestamp).format();
    const add1Day = moment(convertToDate).add(1, 'days');
    const time = moment(add1Day).unix();
    if(now >= time) {
      console.log('Getting the first user from the list...');
      console.log(usersToUnfollow[0].fullName);
      try {
        console.log('Sending unfollow to: ' + usersToUnfollow[0].fullName + ',' + usersToUnfollow[0].username);
        await this.sendUnfollow(usersToUnfollow[0]);
        await this.app.service('sonar').patch(usersToUnfollow[0]._id, {
          closed: true,
          timestamp: now,
        });
      } catch (e) {
        await this.app.service('sonar').patch(usersToUnfollow[0]._id, {
          closed: true,
          timestamp: now,
        });
        console.error(e);
        // errors.unfollow.error = true;
        // errors.unfollow.message = e;
        throw new Error('There was an error sending unfollow to user: ' + usersToUnfollow[0].name);
      }
    } else {
      console.log('No users found to unfollow..');
    }
    // console.log('Waiting 30seconds before going to the next task');
    // await sleep();
    return 'Done';
  }

  async get (id, params) {}
};
