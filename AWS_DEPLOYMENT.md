# AWS Deployment Setup Guide (`feedback.tyagi.fun`)

This guide walks you through deploying the static React feedback website to an AWS S3 Bucket (in Mumbai) and serving it globally via CloudFront with a free SSL certificate for the custom domain (`feedback.tyagi.fun`).

## Architecture Overview
- **S3 Bucket (`ap-south-1`)**: Hosts the static website files.
- **ACM Certificate (`us-east-1`)**: Provides the free SSL certificate.
- **CloudFront (Global CDN)**: Serves the S3 content over HTTPS to the custom domain.
- **IAM**: Provides GitHub Actions the credentials needed to sync files to S3.

> [!IMPORTANT]
> Ensure you have the AWS CLI installed and configured (`aws configure`) before running these commands.

---

## Step 1: Create the S3 Bucket & Configure IAM

Run the following commands in your terminal. This will create the S3 bucket in Mumbai, make it publicly accessible for web hosting, and generate the IAM credentials needed for GitHub Actions.

```bash
# 1. Variables
export BUCKET_NAME="vishal-feedback-data-2026"
export AWS_REGION="ap-south-1" # Mumbai

# 2. Create the S3 Bucket in Mumbai
aws s3api create-bucket \
    --bucket $BUCKET_NAME \
    --region $AWS_REGION \
    --create-bucket-configuration LocationConstraint=$AWS_REGION

# 3. Disable Block Public Access
aws s3api put-public-access-block \
    --bucket $BUCKET_NAME \
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# 4. Enable Web Hosting
aws s3api put-bucket-website \
    --bucket $BUCKET_NAME \
    --website-configuration '{"IndexDocument": {"Suffix": "index.html"},"ErrorDocument": {"Key": "index.html"}}'

# 5. Apply Public Read Policy
aws s3api put-bucket-policy \
    --bucket $BUCKET_NAME \
    --policy '{"Version": "2012-10-17","Statement": [{"Sid": "PublicReadGetObject","Effect": "Allow","Principal": "*","Action": "s3:GetObject","Resource": "arn:aws:s3:::'$BUCKET_NAME'/*"}]}'

# 6. Create GitHub Actions IAM User & Policy
aws iam create-user --user-name github-actions-feedback-deployer

aws iam put-user-policy \
    --user-name github-actions-feedback-deployer \
    --policy-name GitHubActionsS3DeployPolicy \
    --policy-document '{"Version": "2012-10-17","Statement": [{"Effect": "Allow","Action": ["s3:PutObject","s3:GetObject","s3:ListBucket","s3:DeleteObject"],"Resource": ["arn:aws:s3:::'$BUCKET_NAME'","arn:aws:s3:::'$BUCKET_NAME'/*"]}]}'

# 7. Generate Access Keys
aws iam create-access-key --user-name github-actions-feedback-deployer
```

> [!WARNING]
> Save the `AccessKeyId` and `SecretAccessKey` from the final command! You will need to add these to your GitHub Repository Secrets as `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

---

## Step 2: Request Free SSL Certificate (ACM)

To use HTTPS on your custom domain, you must request a free SSL certificate. 
*Note: CloudFront requires this certificate to be generated in `us-east-1` (N. Virginia), even though your S3 bucket is in Mumbai.*

```bash
# Request the Certificate
aws acm request-certificate \
    --domain-name feedback.tyagi.fun \
    --validation-method DNS \
    --region us-east-1
```
Copy the `CertificateArn` from the output and run the next command to get your DNS validation records:

```bash
# Get DNS Validation Records
aws acm describe-certificate \
    --certificate-arn <PASTE_CERTIFICATE_ARN_HERE> \
    --region us-east-1 \
    --query "Certificate.DomainValidationOptions"
```

**Validate in Hostinger:**
1. Open your DNS Zone Editor in Hostinger.
2. Create a new **CNAME** record.
3. Paste the `Name` provided by the AWS command. *(Note: If your provider is Hostinger, only paste the first part of the Name, e.g., `_5ac1fd08...feedback`, because Hostinger automatically appends `.tyagi.fun` to the end!)*
4. Paste the `Value` into the Target box.
5. Wait 5-15 minutes for AWS to verify your domain ownership. You can check the status in the AWS ACM console (make sure your region is us-east-1)—it will say **Issued** in green when ready.

---

## Step 3: Map Domain to S3 via CloudFront

Once the SSL Certificate status shows **Issued** in green, you can connect CloudFront to your S3 bucket using either **Method A (Terminal CLI)** or **Method B (AWS Web Console UI)**.

---

### Method A: Via Terminal AWS CLI (Fastest — 1 Command)

Run the following commands in your terminal:

```bash
# 1. Variables (Replace CERT_ARN with your actual Certificate ARN from Step 2)
export BUCKET_NAME="vishal-feedback-data-2026"
export AWS_REGION="ap-south-1" # Mumbai
export DOMAIN_NAME="feedback.tyagi.fun"
export CERT_ARN="<PASTE_YOUR_ACM_CERTIFICATE_ARN_HERE>"

# 2. S3 Website Endpoint
export S3_ORIGIN_DOMAIN="${BUCKET_NAME}.s3-website.${AWS_REGION}.amazonaws.com"

# 3. Create CloudFront Distribution via AWS CLI
aws cloudfront create-distribution --distribution-config '{
  "CallerReference": "'$(date +%s)'",
  "Aliases": {
    "Quantity": 1,
    "Items": ["'$DOMAIN_NAME'"]
  },
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-Website-Origin",
        "DomainName": "'$S3_ORIGIN_DOMAIN'",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only",
          "OriginSslProtocols": {
            "Quantity": 1,
            "Items": ["TLSv1.2"]
          }
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-Website-Origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": { "Forward": "none" }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "Comment": "CloudFront distribution for feedback.tyagi.fun",
  "Enabled": true,
  "ViewerCertificate": {
    "ACMCertificateArn": "'$CERT_ARN'",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  }
}'
```

---

### Method B: Via AWS Console Web UI (Step-by-Step Web Interface)

If you prefer using the AWS Management Console browser UI:

1. Open the [AWS CloudFront Console](https://console.aws.amazon.com/cloudfront/v3/home#/distributions).
2. Click **Create Distribution**.
3. **Origin Domain**:
   - Paste your S3 Website Endpoint:
     `vishal-feedback-data-2026.s3-website.ap-south-1.amazonaws.com`
   - *(If a popup asks "Use website endpoint", click **Use website endpoint**)*.
   - **Protocol**: Select **HTTP only** (S3 website endpoints do not support HTTPS).
4. **Default Cache Behavior**:
   - **Viewer protocol policy**: Select **Redirect HTTP to HTTPS**.
5. **Web Application Firewall (WAF)**:
   - Select **Do not enable security protections** (to avoid extra monthly charges).
6. **Settings (Domain & SSL Certificate)**:
   - **Alternate domain name (CNAME)**: Click **Add item** and type `feedback.tyagi.fun`.
     > [!WARNING]
     > Do NOT click "Route domains to CloudFront". That is only for AWS Route 53 domains.
   - **Custom SSL certificate**: Select the ACM certificate you requested in Step 2 for `feedback.tyagi.fun`.
   - **Default root object**: Type `index.html`.
7. Click **Create distribution**. Copy the generated CloudFront Domain Name (`d111222abcdef.cloudfront.net`) for Step 4!

---

## Step 4: Final DNS Setup

Once your CloudFront distribution is deployed, it will generate a domain name like `d111222abcdef.cloudfront.net`.

1. Go back to your Hostinger DNS Zone Editor.
2. Create a final **CNAME** record.
3. **Name**: `feedback`
4. **Target/Value**: `d111222abcdef.cloudfront.net`

## GitHub Actions Secrets Required
To enable the `.github/workflows/cd-feedback.yml` workflow, ensure you have added the following secrets to your GitHub repository:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (Set to `ap-south-1`)
- `AWS_S3_BUCKET` (Set to `vishal-feedback-data-2026`)

---

## Troubleshooting

### 1. CloudFront shows a blank page or Access Denied
Ensure that in **Step 3 (Step 2: Specify origin)** you pasted the S3 **Website Endpoint** (ending in `s3-website.ap-south-1.amazonaws.com`) and NOT the standard S3 REST endpoint.

### 2. CloudFront throws a "504 Gateway Timeout" Error
This happens if CloudFront tries to talk to the S3 bucket using HTTPS. S3 website endpoints do not support HTTPS! 
**Fix:** Go to your CloudFront distribution -> **Origins** tab -> Select your origin and click **Edit** -> Scroll to **Protocol** and change it to **HTTP only**. Save changes and wait 3 minutes.

### 3. GitHub Action fails with "Unauthorized" when pulling from GHCR
GitHub Container Registry (GHCR) images default to private. To fix this, ensure your workflow logs into Docker using the `GITHUB_TOKEN` before running the image, and ensure the job has `packages: read` permissions.

### 4. DNS CNAME not resolving
Ensure you did not accidentally create a duplicate domain ending (e.g., `feedback.tyagi.fun.tyagi.fun`). Hostinger automatically appends your root domain to the Name field.

### 5. AccessDenied: "Your account must be verified before you can add new CloudFront resources"
**Why this happened:**
AWS places a temporary security verification check on CloudFront for new or recently created AWS accounts to prevent abuse.

**Solution Option A (Unblock AWS CloudFront via Support Ticket — Recommended):**
1. Open the [AWS Support Center](https://console.aws.amazon.com/support/home#/case/create?issueType=service-limit-increase) in your browser.
2. Choose **Account and billing support** (or Service limit increase).
3. **Subject**: `Verify Account for CloudFront`
4. **Description**:
   ```text
   Hi AWS Support, I am getting the following error when creating a CloudFront distribution:
   "An error occurred (AccessDenied) when calling the CreateDistribution operation: Your account must be verified before you can add new CloudFront resources."
   Please verify my account and enable CloudFront distribution creation. Thank you!
   ```
5. AWS Support typically unlocks CloudFront within 1–4 hours.

**Solution Option B (Instant Live Setup via Hostinger without waiting):**
If you want `feedback.tyagi.fun` live right now while waiting for AWS Support:
1. Open your **Hostinger DNS Zone Editor**.
2. Add a **CNAME** record:
   - **Type**: `CNAME`
   - **Name**: `feedback`
   - **Target / Value**: `vishal-feedback-data-2026.s3-website.ap-south-1.amazonaws.com`
3. Your feedback site will be live immediately!
