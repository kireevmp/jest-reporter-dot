<h1 align="center">jest-reporter-dot</h1>

<p align="center">
  A better dot reporter for <a href="https://github.com/facebook/jest" target="_blank">Jest</a>.
</p>

## Installation

You can install this package as a development dependency.

```bash
$ npm i --save-dev jest-reporter-dot

$ yarn add --dev jest-reporter-dot
```

## Example

<p align="center">
  <img src="https://user-images.githubusercontent.com/29187880/222933289-a3ab5b17-f476-483d-91b5-e6d4bffa250a.gif" alt="Usage example" width="600px" />
</p>

## Configuration

Configure [Jest](https://facebook.github.io/jest/docs/en/configuration.html) to use the reporter.

Add a reporter to your `jest.config.js` file:

```javascript
module.exports = {
  // Your config...
  reporters: ["jest-reporter-dot"],
}
```

The plugin is not configurable and accepts no options.
