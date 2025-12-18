import { WebClient } from '@slack/web-api';
import { capitalize } from '@/lib/stringUtils';

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

interface BuildNotification {
  buildId: string;
  appName: string;
  buildType: string;
  status: 'success' | 'failed' | 'started' | 'reviewing';
  message: string;
}

/**
 * Send build status notification to Slack
 */
export async function notifyBuildStatus(
  slackUserId: string,
  notification: BuildNotification
): Promise<void> {
  const { buildId, appName, buildType, status, message } = notification;
  
  const emoji = status === 'success' ? '✅' :
                status === 'failed' ? '❌' :
                status === 'started' ? '🚀' :
                '⏳';
  
  const statusText = status === 'success' ? 'Build Completed' :
                     status === 'failed' ? 'Build Failed' :
                     status === 'started' ? 'Build Started' :
                     'Awaiting Review';
  
  const color = status === 'success' ? '#36a64f' :
                status === 'failed' ? '#ff0000' :
                status === 'started' ? '#0066ff' :
                '#ffaa00';
  
  try {
    await slackClient.chat.postMessage({
      channel: slackUserId,
      text: `${emoji} ${statusText}: ${appName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} ${statusText}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*App:*\n${appName}`,
            },
            {
              type: 'mrkdwn',
              text: `*Build Type:*\n${capitalize(buildType)}`,
            },
            {
              type: 'mrkdwn',
              text: `*Build ID:*\n${buildId}`,
            },
            {
              type: 'mrkdwn',
              text: `*Status:*\n${statusText}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message,
          },
        },
        {
          type: 'divider',
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Build timestamp: ${new Date().toISOString()}`,
            },
          ],
        },
      ],
      attachments: [
        {
          color,
          footer: 'Apple Newton Build Platform',
          footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
        },
      ],
    });
    
    console.log(`[Slack] Notification sent to ${slackUserId}`);
    
  } catch (error) {
    console.error('[Slack] Failed to send notification:', error);
    // Don't throw - notification failure shouldn't break the build
  }
}

/**
 * Send review request notification to admins
 */
export async function notifyReviewRequired(
  adminChannelId: string,
  buildInfo: {
    buildId: string;
    appName: string;
    buildType: string;
    userId: string;
    userName: string;
  }
): Promise<void> {
  const { buildId, appName, buildType, userId, userName } = buildInfo;
  
  try {
    await slackClient.chat.postMessage({
      channel: adminChannelId,
      text: `🔔 New build review required: ${appName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🔔 Build Review Required',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*App:*\n${appName}`,
            },
            {
              type: 'mrkdwn',
              text: `*Build Type:*\n${capitalize(buildType)}`,
            },
            {
              type: 'mrkdwn',
              text: `*Submitted by:*\n${userName}`,
            },
            {
              type: 'mrkdwn',
              text: `*Build ID:*\n${buildId}`,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Review Build',
              },
              style: 'primary',
              url: `${process.env.NEXTAUTH_URL}/admin/builds/${buildId}`,
            },
          ],
        },
      ],
    });
    
    console.log(`[Slack] Review notification sent to ${adminChannelId}`);
    
  } catch (error) {
    console.error('[Slack] Failed to send review notification:', error);
  }
}

/**
 * Send TestFlight publication notification
 */
export async function notifyTestFlightPublished(
  slackUserId: string,
  buildInfo: {
    appName: string;
    buildId: string;
    testFlightUrl?: string;
  }
): Promise<void> {
  const { appName, buildId, testFlightUrl } = buildInfo;
  
  try {
    await slackClient.chat.postMessage({
      channel: slackUserId,
      text: `🎉 ${appName} is now available on TestFlight!`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎉 Published to TestFlight',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Your app *${appName}* has been approved by Apple and is now available on TestFlight!`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*App:*\n${appName}`,
            },
            {
              type: 'mrkdwn',
              text: `*Build ID:*\n${buildId}`,
            },
          ],
        },
        ...(testFlightUrl ? [{
          type: 'actions' as const,
          elements: [
            {
              type: 'button' as const,
              text: {
                type: 'plain_text' as const,
                text: 'Open in TestFlight',
              },
              style: 'primary' as const,
              url: testFlightUrl,
            },
          ],
        }] : []),
      ],
      attachments: [
        {
          color: '#36a64f',
          footer: 'Apple Newton Build Platform',
        },
      ],
    });
    
    console.log(`[Slack] TestFlight notification sent to ${slackUserId}`);
    
  } catch (error) {
    console.error('[Slack] Failed to send TestFlight notification:', error);
  }
}

