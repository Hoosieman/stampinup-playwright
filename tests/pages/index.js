//Central export file for all page objects

const { BasePage } = require('./base.page');
const { LoginPage } = require('./login.page');
const { SignupPage } = require('./signup.page');
const { ProfilePage } = require('./profile.page');
const { AddressPage } = require('./address.page');

module.exports = {
  BasePage,
  LoginPage,
  SignupPage,
  ProfilePage,
  AddressPage,
};
