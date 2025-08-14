# WeChat Mini Program Deployment

This document explains how to set up automatic deployment of the WeChat Mini Program using GitHub Actions.

## Prerequisites

1. **WeChat Developer Account**: You need a verified WeChat developer account
2. **Mini Program App ID**: Your Mini Program's unique identifier
3. **Private Key**: The private key file for API access

## Required GitHub Secrets

To use the automatic deployment workflow, you need to set up the following secrets in your GitHub repository:

### 1. WECHAT_APPID

Your WeChat Mini Program's App ID. You can find this in the WeChat Developer Console.

**How to set:**

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `WECHAT_APPID`
5. Value: Your Mini Program App ID (e.g., `wx1234567890abcdef`)

### 2. WECHAT_PRIVATE_KEY

The private key content for API access. This is the content of your private key file.

**How to set:**

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `WECHAT_PRIVATE_KEY`
5. Value: The entire content of your private key file (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)

## How to Get the Private Key

1. Log in to the [WeChat Developer Console](https://mp.weixin.qq.com/)
2. Go to Development → Development Management → Development Settings
3. In the "Server Domain" section, click "Download Private Key"
4. Save the private key file securely

## Workflow Trigger

The deployment workflow automatically triggers when:

- Code is pushed to the `main` or `master` branch
- Changes are made to files in the `apps/weapp/` directory
- Manually triggered via GitHub Actions UI

## What the Workflow Does

1. **Checkout**: Downloads the latest code
2. **Setup**: Installs Node.js and pnpm
3. **Dependencies**: Installs project dependencies
4. **Build**: Builds the WeChat Mini Program using Taro
5. **Deploy**: Creates the private key file and environment variables, then uploads to WeChat
6. **Cleanup**: Removes sensitive files

## Version Management

The workflow automatically generates version numbers based on timestamps to ensure unique versions for each deployment.

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Check that your `WECHAT_APPID` and `WECHAT_PRIVATE_KEY` are correct
2. **Build Errors**: Ensure all dependencies are properly installed
3. **Upload Failures**: Verify your Mini Program has upload permissions

### Manual Deployment

If you need to deploy manually:

```bash
cd apps/weapp
pnpm install
pnpm build:weapp
pnpm publish:weapp
```

## Security Notes

- Never commit the private key file to your repository
- The workflow automatically cleans up sensitive files after deployment
- Use repository secrets to store sensitive information
- Regularly rotate your private keys

## Support

If you encounter issues with the deployment workflow, check:

1. GitHub Actions logs for detailed error messages
2. WeChat Developer Console for upload status
3. Repository secrets configuration
