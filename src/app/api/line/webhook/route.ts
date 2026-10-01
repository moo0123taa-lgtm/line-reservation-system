import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getStoreSettings } from '@/lib/db';
import { getLineBotClient } from '@/lib/line';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-line-signature');

    const settings = getStoreSettings();
    const channelSecret = settings.lineChannelSecret || process.env.LINE_CHANNEL_SECRET;

    // 署名検証（Channel Secretが設定されている場合）
    if (channelSecret && signature) {
      const hash = crypto
        .createHmac('SHA256', channelSecret)
        .update(rawBody)
        .digest('base64');
      if (hash !== signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    const events = body.events || [];

    const client = getLineBotClient(settings);
    if (!client) {
      console.log('[Webhook] LINE Client not configured, returning 200');
      return NextResponse.json({ success: true });
    }

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    const reservationUrl = settings.liffId
      ? `https://liff.line.me/${settings.liffId}`
      : `${baseUrl}/reserve`;

    for (const event of events) {
      if (event.type === 'follow') {
        // 友だち追加時
        await client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              type: 'text',
              text: `友だち追加ありがとうございます！🎉\n【${settings.storeName}】公式アカウントです。\n\nトーク画面または下のリンクから24時間いつでも簡単に空き状況の確認・ご予約が可能です。`,
            },
            {
              type: 'flex',
              altText: `${settings.storeName}の予約はこちら`,
              contents: {
                type: 'bubble',
                hero: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: '✨ 24時間 WEB即時予約 ✨',
                      weight: 'bold',
                      color: '#FFFFFF',
                      align: 'center',
                      size: 'md',
                    },
                  ],
                  backgroundColor: '#06C755',
                  paddingAll: '20px',
                },
                body: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: settings.storeName,
                      weight: 'bold',
                      size: 'xl',
                    },
                    {
                      type: 'text',
                      text: 'メニューと日時の空き状況を見ながら、カンタンに予約できます。',
                      size: 'sm',
                      color: '#666666',
                      wrap: true,
                      margin: 'md',
                    },
                  ],
                },
                footer: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'button',
                      action: {
                        type: 'uri',
                        label: '📅 今すぐ空き状況を見て予約する',
                        uri: reservationUrl,
                      },
                      style: 'primary',
                      color: '#06C755',
                    },
                  ],
                },
              },
            },
          ],
        });
      } else if (event.type === 'message' && event.message.type === 'text') {
        // テキストメッセージ受信時
        const text = event.message.text.trim();
        if (text.includes('予約') || text.includes('空き') || text.includes('メニュー')) {
          await client.replyMessage({
            replyToken: event.replyToken,
            messages: [
              {
                type: 'flex',
                altText: '予約・空き状況の確認',
                contents: {
                  type: 'bubble',
                  body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        text: 'ご予約・空き状況の確認',
                        weight: 'bold',
                        size: 'lg',
                        color: '#06C755',
                      },
                      {
                        type: 'text',
                        text: '以下のボタンをタップして、メニューと空き枠を選んでご予約ください。',
                        size: 'sm',
                        color: '#555555',
                        margin: 'md',
                        wrap: true,
                      },
                    ],
                  },
                  footer: {
                    type: 'box',
                    layout: 'vertical',
                    spacing: 'sm',
                    contents: [
                      {
                        type: 'button',
                        action: {
                          type: 'uri',
                          label: '📅 予約・空き状況をみる',
                          uri: reservationUrl,
                        },
                        style: 'primary',
                        color: '#06C755',
                      },
                      {
                        type: 'button',
                        action: {
                          type: 'uri',
                          label: '🔍 自分の予約を確認する',
                          uri: `${reservationUrl}?view=my`,
                        },
                        style: 'secondary',
                      },
                    ],
                  },
                },
              },
            ],
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[LINE Webhook Error]:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
