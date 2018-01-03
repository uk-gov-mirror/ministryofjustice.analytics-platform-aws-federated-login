const { URL, URLSearchParams } = require('url');
const aws = require('aws-sdk');
const request = require('request-promise-native');

const sts = new aws.STS();


class AWSFederatedLogin {
  constructor({
    federation_url = 'https://signin.aws.amazon.com/federation', aws_account_id,
    login_url, role_name, session_name, jwt,
  }) {
    this.aws_account_id = aws_account_id;
    this.login_url = login_url;
    this.role_name = role_name;
    this.session_name = session_name;
    this.jwt = jwt;
    this.federation_url = federation_url;
  }

  temp_creds() {
    return sts.assumeRoleWithWebIdentity({
      RoleArn: `arn:aws:iam::${this.aws_account_id}:role/${this.role_name}`,
      RoleSessionName: this.session_name,
      WebIdentityToken: this.jwt,
    }).promise()
      .then(resp => resp.Credentials);
  }

  console_session() {
    return this.temp_creds()
      .then(creds => ({
        sessionId: creds.AccessKeyId,
        sessionKey: creds.SecretAccessKey,
        sessionToken: creds.SessionToken,
      }));
  }

  signin_token(session_duration) {
    return this.console_session()
      .then(sess => request({
        uri: this.federation_url,
        qs: {
          Action: 'getSigninToken',
          SessionDuration: session_duration,
          Session: JSON.stringify(sess),
        },
        json: true,
      }))
      .then(response => response.SigninToken);
  }

  console_url(
    destination = 'https://console.aws.amazon.com/',
    session_duration = 43200,
  ) {
    return this.signin_token(session_duration)
      .then((token) => {
        const url = new URL(this.federation_url);
        url.search = new URLSearchParams({
          Action: 'login',
          Issuer: this.login_url,
          Destination: destination,
          SigninToken: token,
        });
        return url.toString();
      });
  }
}

module.exports = AWSFederatedLogin;
