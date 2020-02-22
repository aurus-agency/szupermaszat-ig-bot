/* eslint-disable no-unused-vars */
const { get } = require('lodash');
const inquirer = require('inquirer');
const cron = require('node-cron');

exports.Bootstrap = class Bootstrap {
  constructor (options, app) {
    this.options = options || {};
    this.app = app;
    this.welcome = {
      error: false,
      message: null,
    };
    this.direct = {
      error: false,
      message: null,
    };
    this.directPending = {
      error: false,
      message: null,
    };
    this.follow = {
      error: false,
      message: null,
    };
    this.unfollow = {
      error: false,
      message: null,
    };
  }

  async login() {
    const client = await this.app.service('core').client();

    let auth = null;

    console.log(`Generating device token for ${process.env.IG_USERNAME}...`);
    await client.state.generateDevice(process.env.IG_USERNAME);

    try {
      console.log('Sending preflight...');
      await client.simulate.preLoginFlow();
      
      console.log('Attempting to login...');
      auth = await client.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);

      console.log('Doing post login...');
      await client.simulate.postLoginFlow();

      console.log('Logged in successfully!');
      await this.app.set('instagramUser', auth);
    } catch (e) {
      console.log('Login failed, checking for resolvers...');
      const twoFactorIdentifier = get(e, 'response.body.two_factor_info.two_factor_identifier');

      if (!twoFactorIdentifier) {
        throw new Error('Unable to login, no 2fa identifier found');
      }

      console.log('Login failed because of 2FA is enabled on the account');
      console.log('Requesting auth code...');
      const { code } = await inquirer.prompt([{
        type: 'input',
        name: 'code',
        message: 'Enter code',
      }]);

      console.log('Sending preflight...');
      await client.simulate.preLoginFlow();

      console.log('Attempting to log in again...');
      auth = await client.account.twoFactorLogin({
        username: process.env.IG_USERNAME,
        verificationCode: code,
        twoFactorIdentifier,
        verificationMethod: '1',
        trustThisDevice: '1',
      });

      console.log('Doing post login...');
      await client.simulate.postLoginFlow();

      console.log('Logged in successfully!');
      await this.app.set('instagramUser', auth);
    }
    return auth;
  }

  async init() {
    try {
      await this.login();
    } catch (e) {
      console.error(e);
    }
    // const messages = await this.app.service('messages').getMessages();
    let i = 0;
    cron.schedule('*/30 * * * *', async () => {
      if (!this.follow.error) {
        console.log('Searching for users to follow');
        try {
          await this.app.service('followers').searchForUsersToFollow();
        } catch (e) {
          this.follow.message = e;
        }
        console.log('Searching for users to follow ended, going to next task...');
      } else {
        console.error('Skipping searching for users to follow cause of previous errors');
        console.error(this.follow.message);
      }
      if (!this.unfollow.error) {
        console.log('Searching for users to unfollow');
        try {
          await this.app.service('followers').searchForUsersToUnfollow();
        } catch (e) {
          this.unfollow.message = e;
        }
        console.log('Checking for users to unfollow ended, now sleeping for 1800 seconds');
      } else {
        console.error('Skipping unfollowing users cause of previous errors');
        console.error(this.unfollow.message);
      }
    });
  }

  async get () {}
};
