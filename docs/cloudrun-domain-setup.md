# Setting Up Your Custom Domain with Google Cloud Run

This guide will walk you through the process of mapping your custom domain to your FAIT Co-op application running on Google Cloud Run.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. Your FAIT Co-op application deployed to Cloud Run
3. A registered domain name
4. Access to your domain's DNS settings

## Step 1: Verify Domain Ownership

Before you can map your domain to Cloud Run, you need to verify that you own the domain:

1. Go to the [Google Search Console](https://search.console.google.com/welcome)
2. Click on "Add Property" and enter your domain
3. Follow the verification steps (typically involves adding a DNS record)

## Step 2: Configure Domain Mapping in Cloud Run

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to Cloud Run
3. Select your FAIT Co-op service
4. Click on the "Domain Mappings" tab
5. Click "Add Mapping"
6. Enter your domain name (e.g., yourdomain.com)
7. Click "Continue"
8. Select your service and click "Continue"
9. Review the settings and click "Add Mapping"

## Step 3: Update DNS Records

After creating the domain mapping, Google will provide you with a list of DNS records that you need to add to your domain registrar:

1. Log in to your domain registrar (e.g., GoDaddy, Namecheap, Google Domains)
2. Go to the DNS settings for your domain
3. Add the DNS records provided by Google Cloud Run:
   - For the root domain (yourdomain.com): Add an A record
   - For www subdomain (www.yourdomain.com): Add a CNAME record

Example DNS records:
```
Type    Name    Value                           TTL
A       @       ghs.googlehosted.com            3600
CNAME   www     ghs.googlehosted.com            3600
```

## Step 4: Configure SSL Certificate

Cloud Run automatically provisions and manages SSL certificates for your custom domain:

1. After adding the DNS records, return to the Domain Mappings page in Cloud Run
2. Wait for the SSL certificate to be provisioned (this can take up to 24 hours)
3. The status will change to "Certificate Active" when it's ready

## Step 5: Test Your Domain

1. Wait for DNS propagation (can take up to 48 hours, but often much faster)
2. Visit your domain in a web browser
3. Verify that your FAIT Co-op application loads correctly
4. Check that the connection is secure (https)

## Troubleshooting

### Certificate Provisioning Issues

If your certificate isn't provisioning:
1. Verify that your DNS records are correct
2. Check that DNS propagation has completed using a tool like [dnschecker.org](https://dnschecker.org/)
3. Ensure your domain is verified in Google Search Console

### DNS Configuration Issues

If your site isn't accessible:
1. Confirm that your DNS records match exactly what Google provided
2. Check for any conflicting DNS records
3. Ensure you've waited for DNS propagation

### Application Issues

If your application doesn't work correctly:
1. Check Cloud Run logs for any errors
2. Verify that your application is configured to work with HTTPS
3. Ensure your Content Security Policy allows your domain

## Additional Resources

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Run Domain Mapping Documentation](https://cloud.google.com/run/docs/mapping-custom-domains)
- [Google Search Console](https://search.console.google.com/welcome)
- [DNS Checker](https://dnschecker.org/)
