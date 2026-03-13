# Webhook Integration Guide

**Real-Time Alerts for Slack and Microsoft Teams**

This guide explains how to configure Slack and Microsoft Teams webhooks to receive real-time alerts from the ISA monitoring system directly in your team communication channels.

---

## Overview

The webhook integration enables instant notifications for:

- **Error Rate Alerts**: When error rates exceed configured thresholds
- **Critical Error Alerts**: When critical errors are detected in the system
- **Performance Degradation**: When system performance degrades significantly

Alerts are automatically sent to all configured and enabled webhook endpoints whenever the alert detection system triggers.

---

## Features

### Rich Message Formatting

- **Slack**: Uses Slack Blocks API for interactive, visually appealing messages
- **Teams**: Uses Adaptive Cards for rich, actionable notifications

### Automatic Retry Logic

- Exponential backoff retry for transient failures (5xx errors)
- Up to 3 retry attempts with increasing delays (1s, 2s, 4s)
- No retry for client errors (4xx) to avoid webhook rate limits

### Delivery Tracking

- Complete delivery history with success/failure status
- Delivery statistics by platform and time period
- Error logging for failed deliveries

### Security

- Webhook URLs are masked in logs and delivery history
- Only the last path segment (token) is hidden for security

---

## Setup Instructions

### Slack Webhook Setup

1. **Navigate to Slack Workspace Settings**
   - Go to your Slack workspace
   - Click on workspace name → Settings & administration → Manage apps

2. **Create Incoming Webhook**
   - Search for "Incoming Webhooks" in the app directory
   - Click "Add to Slack"
   - Select the channel where you want to receive alerts
   - Click "Add Incoming WebHooks integration"

3. **Copy Webhook URL**
   - Copy the webhook URL provided (format: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`)
   - Keep this URL secure - it provides direct posting access to your channel

4. **Configure in ISA**
   - Navigate to Admin → System Monitoring → Webhooks tab
   - Click "Add Webhook Integration"
   - Select "Slack" as platform
   - Paste the webhook URL
   - Enter channel name (optional, for reference)
   - Enable the webhook
   - Click "Save Configuration"

5. **Test the Integration**
   - Click the "Test" button (send icon) next to your configuration
   - Check your Slack channel for the test message
   - If successful, you'll see a confirmation toast

### Microsoft Teams Webhook Setup

1. **Navigate to Teams Channel**
   - Open Microsoft Teams
   - Go to the channel where you want to receive alerts
   - Click the "..." menu next to the channel name

2. **Add Incoming Webhook Connector**
   - Select "Connectors" from the menu
   - Search for "Incoming Webhook"
   - Click "Configure" next to Incoming Webhook

3. **Configure Webhook**
   - Enter a name (e.g., "ISA Monitoring Alerts")
   - Optionally upload an icon
   - Click "Create"

4. **Copy Webhook URL**
   - Copy the webhook URL provided (format: `https://outlook.office.com/webhook/...`)
   - Click "Done"

5. **Configure in ISA**
   - Navigate to Admin → System Monitoring → Webhooks tab
   - Click "Add Webhook Integration"
   - Select "Microsoft Teams" as platform
   - Paste the webhook URL
   - Enter channel name (optional, for reference)
   - Enable the webhook
   - Click "Save Configuration"

6. **Test the Integration**
   - Click the "Test" button (send icon) next to your configuration
   - Check your Teams channel for the test message
   - If successful, you'll see a confirmation toast

---

## Message Format Examples

### Slack Message Structure

```
🚨 [CRITICAL] High Error Rate Detected

Error rate has exceeded the critical threshold.

Details:
  Current Rate: 52 errors/hour
  Threshold: 50 errors/hour
  Time Window: Last hour

[View Dashboard] (button linking to monitoring page)

Timestamp: Jan 2, 2026 1:30 PM
```

### Teams Message Structure

```
🚨 High Error Rate Detected

Error rate has exceeded the critical threshold.

Current Rate: 52 errors/hour
Threshold: 50 errors/hour
Time Window: Last hour

[View Dashboard] (action button)

Severity: CRITICAL | Jan 2, 2026 1:30 PM
```

---

## Alert Severity Levels

### Info (Blue/Green)
- System updates and informational messages
- Non-urgent notifications
- Slack color: Green (#36a64f)
- Teams color: Good

### Warning (Orange/Yellow)
- Potential issues requiring attention
- Performance degradation warnings
- Approaching threshold alerts
- Slack color: Orange (#ff9900)
- Teams color: Warning

### Critical (Red)
- Urgent issues requiring immediate action
- System failures or critical errors
- Threshold breaches
- Slack color: Red (#ff0000)
- Teams color: Attention

---

## Managing Webhooks

### Enable/Disable Webhooks

Toggle the switch next to any webhook configuration to enable or disable it without deleting the configuration.

### Testing Webhooks

Use the "Test" button to send a test message to verify the webhook is working correctly. The test message includes:
- Test notification title
- Confirmation message
- Current timestamp
- Link to monitoring dashboard

### Viewing Delivery History

The Webhooks tab shows recent delivery attempts with:
- Platform (Slack/Teams)
- Severity level
- Success/failure status
- Timestamp
- Error messages (if failed)

### Deleting Webhooks

Click the trash icon to permanently delete a webhook configuration. This action cannot be undone.

---

## Troubleshooting

### Test Message Not Received

**Check webhook URL:**
- Ensure the URL is copied correctly without extra spaces
- Verify the webhook hasn't been deleted in Slack/Teams

**Check webhook status:**
- Ensure the webhook is enabled (toggle switch is on)
- Check delivery history for error messages

**Slack-specific:**
- Verify the channel still exists
- Check if the webhook integration is still active in Slack settings

**Teams-specific:**
- Verify the connector is still configured in the channel
- Check if the channel permissions allow incoming webhooks

### Webhook Delivery Failures

**4xx Errors (400, 401, 404):**
- Webhook URL is invalid or has been revoked
- Recreate the webhook in Slack/Teams and update the URL in ISA

**5xx Errors (500, 503):**
- Temporary service issues with Slack/Teams
- System will automatically retry up to 3 times
- If persistent, check Slack/Teams status pages

**Network Errors:**
- Check ISA server connectivity
- Verify firewall rules allow outbound HTTPS connections

### No Alerts Being Sent

**Check alert detection:**
- Navigate to System Monitoring → Alerts tab
- Verify alerts are being triggered
- Check alert history for recent alerts

**Check webhook configuration:**
- Ensure at least one webhook is enabled
- Test the webhook manually to verify connectivity

**Check alert cooldown:**
- Alerts have cooldown periods to prevent spam
- Default cooldowns: 30-60 minutes depending on alert type
- Check alert history for "cooldown active" indicators

---

## Alert Integration Flow

```
┌─────────────────────┐
│  Alert Detection    │
│  (Every 5 minutes)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Check Thresholds    │
│ - Error Rate        │
│ - Critical Errors   │
│ - Performance       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Alert Triggered?    │
└──────────┬──────────┘
           │ Yes
           ▼
┌─────────────────────┐
│ Check Cooldown      │
└──────────┬──────────┘
           │ Not in cooldown
           ▼
┌─────────────────────┐
│ Send Notifications  │
│ 1. Email (owner)    │
│ 2. Webhooks (all)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Track Delivery      │
│ - Success/Failure   │
│ - Retry Attempts    │
│ - Error Messages    │
└─────────────────────┘
```

---

## API Reference

### Webhook Payload Structure

```typescript
interface AlertPayload {
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  timestamp: Date;
  details?: Record<string, unknown>;
  actionUrl?: string;
}
```

### Delivery Result

```typescript
interface WebhookDeliveryResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  deliveryId?: number;
}
```

---

## Best Practices

### Channel Selection

- **Dedicated Alert Channel**: Create a dedicated channel for monitoring alerts
- **Avoid General Channels**: Don't send alerts to high-traffic general channels
- **Team Visibility**: Ensure relevant team members have access to the alert channel

### Alert Fatigue Prevention

- **Tune Thresholds**: Adjust alert thresholds to reduce false positives
- **Use Cooldowns**: Leverage cooldown periods to prevent alert spam
- **Acknowledge Alerts**: Use the alert acknowledgment feature to track resolution

### Security

- **Protect Webhook URLs**: Treat webhook URLs as secrets
- **Rotate Webhooks**: Periodically regenerate webhooks if compromised
- **Audit Access**: Regularly review who has access to webhook configuration

### Monitoring

- **Check Delivery Stats**: Regularly review webhook delivery statistics
- **Monitor Failures**: Investigate recurring delivery failures
- **Test Periodically**: Test webhooks monthly to ensure they're working

---

## Related Documentation

- [ALERTING_SYSTEM.md](./ALERTING_SYSTEM.md) - Alert detection and notification system
- [MONITORING_TESTS.md](./MONITORING_TESTS.md) - Monitoring system test coverage
- [NEWS_PIPELINE.md](./NEWS_PIPELINE.md) - News pipeline monitoring integration

---

## Support

For issues or questions about webhook integration:

1. Check delivery history in the Webhooks tab for error messages
2. Test the webhook manually using the Test button
3. Review Slack/Teams webhook documentation for platform-specific issues
4. Check ISA system logs for detailed error information

---

**Last Updated**: January 2026  
**Version**: 1.0.0
