# analytics-platform-aws-federated-login
Web app to handle federated AWS console login with JWTs

[![Code maintainability](https://api.codeclimate.com/v1/badges/c72245bb15d01e3d1aed/maintainability)](https://codeclimate.com/github/ministryofjustice/analytics-platform-aws-federated-login/maintainability)

[![Test Coverage](https://api.codeclimate.com/v1/badges/c72245bb15d01e3d1aed/test_coverage)](https://codeclimate.com/github/ministryofjustice/analytics-platform-aws-federated-login/test_coverage)

CI?: Not at present. Run tests manually: TODO explanation

CD?: Not at present. Install manually by [helm chart](https://github.com/ministryofjustice/analytics-platform-helm-charts/tree/master/charts/aws-login)

Runs at: https://aws.services.alpha.mojanalytics.xyz/login

## Usage

1. A user wishing to log-in to the AWS Console should go to the running analytics-platform-aws-federated-login service. Construct the URL like this:

        args = urlencode({
            "destination": f"/s3/buckets/{name}/?region={region}&tab=overview",
        })
        return f"https://aws.services.{env}.mojanalytics.xyz/?{args}"

   Example: `https://aws.services.alpha.mojanalytics.xyz/?destination=%2Fs3%2Fbuckets%2Falpha-hmpps-performance%2F%3Fregion%3Deu-west-1%26tab%3Doverview`

2. analytics-platform-aws-federated-login will redirect to Auth0 to prompt the user to login to AP.

   ![AP Login](/doc/login.png "AP Login")

3. Then they will be redirected the AWS Console, logged in as their IAM Role e.g. alpha_user_davidread using Federated Login. Uses a temporary token (lasts 1 hour?).

   ![foo](/doc/aws-console.png "AWS console")
