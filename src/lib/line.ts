import { messagingApi } from '@line/bot-sdk';
import { Reservation, StoreSettings } from '@/types';

// LINE Bot クライアントの取得
export function getLineBotClient(settings: StoreSettings): messagingApi.MessagingApiClient | null {
  const token = settings.lineChannelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    return null;
  }
  return new messagingApi.MessagingApiClient({
    channelAccessToken: token,
  });
}

/**
 * 予約完了時のLINE Flex Messageを作成
 */
export function createReservationFlexMessage(reservation: Reservation, storeName: string): messagingApi.FlexMessage {
  const altText = `【${storeName}】ご予約が確定いたしました（${reservation.date} ${reservation.startTime}〜）`;

  return {
    type: 'flex',
    altText,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#06C755',
        contents: [
          {
            type: 'text',
            text: 'ご予約完了のお知らせ',
            weight: 'bold',
            color: '#FFFFFF',
            size: 'lg',
          },
          {
            type: 'text',
            text: storeName,
            color: '#E8F5E9',
            size: 'xs',
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: '予約番号',
                size: 'xs',
                color: '#888888',
                flex: 3,
              },
              {
                type: 'text',
                text: reservation.reservationNumber,
                size: 'xs',
                weight: 'bold',
                color: '#333333',
                flex: 7,
              },
            ],
          },
          {
            type: 'separator',
          },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '日時',
                    size: 'sm',
                    color: '#666666',
                    flex: 3,
                  },
                  {
                    type: 'text',
                    text: `${reservation.date} ${reservation.startTime} - ${reservation.endTime}`,
                    size: 'sm',
                    weight: 'bold',
                    color: '#111111',
                    flex: 7,
                  },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: 'メニュー',
                    size: 'sm',
                    color: '#666666',
                    flex: 3,
                  },
                  {
                    type: 'text',
                    text: reservation.menuNames.join('\n'),
                    size: 'sm',
                    color: '#111111',
                    flex: 7,
                    wrap: true,
                  },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '所要時間',
                    size: 'sm',
                    color: '#666666',
                    flex: 3,
                  },
                  {
                    type: 'text',
                    text: `約 ${reservation.totalDuration} 分`,
                    size: 'sm',
                    color: '#111111',
                    flex: 7,
                  },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: 'お会計目安',
                    size: 'sm',
                    color: '#666666',
                    flex: 3,
                  },
                  {
                    type: 'text',
                    text: `¥${reservation.totalPrice.toLocaleString()} (税込)`,
                    size: 'sm',
                    weight: 'bold',
                    color: '#06C755',
                    flex: 7,
                  },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: 'お名前',
                    size: 'sm',
                    color: '#666666',
                    flex: 3,
                  },
                  {
                    type: 'text',
                    text: `${reservation.customerName} 様`,
                    size: 'sm',
                    color: '#111111',
                    flex: 7,
                  },
                ],
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'text',
            text: '※日時のご変更やキャンセルは、お電話または予約確認ページよりお願いいたします。ご来店を心よりお待ちしております。',
            size: 'xxs',
            color: '#999999',
            wrap: true,
          },
        ],
      },
    },
  };
}

/**
 * LINEプッシュ通知で予約完了を送信する
 */
export async function sendReservationNotification(
  reservation: Reservation,
  settings: StoreSettings
): Promise<boolean> {
  if (!reservation.customerLineId) {
    return false;
  }

  const client = getLineBotClient(settings);
  if (!client) {
    console.log('[LINE] Bot client not configured, skipping push message.');
    return false;
  }

  try {
    const flexMessage = createReservationFlexMessage(reservation, settings.storeName);
    await client.pushMessage({
      to: reservation.customerLineId,
      messages: [flexMessage],
    });
    console.log(`[LINE] Successfully sent reservation message to ${reservation.customerLineId}`);
    return true;
  } catch (error) {
    console.error('[LINE] Error sending push message:', error);
    return false;
  }
}
