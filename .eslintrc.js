module.exports = {
  "extends": "airbnb-base",
  "rules": {
    "camelcase": ["off"],
    "no-use-before-define": ["error", { "classes": false }],
    "no-underscore-dangle": ["error", { "allow": ["_json"] }]
  }
};
