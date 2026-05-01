import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { imageData, description } = await request.json();

    // Remove data URI prefix if present
    const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `You are an expert construction marketing copywriter. Based on this construction/job site photo and the user's description, write a professional, engaging social media post caption for a construction company. The caption should:

1. Be 2-3 sentences max
2. Highlight progress, quality, and timeline
3. Sound professional but accessible
4. Include an emoji if appropriate
5. Be formatted for social media (Instagram/Facebook/LinkedIn)

User's description: "${description}"

Write only the caption, nothing else.`,
            },
          ],
        },
      ],
    });

    const caption = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ caption });
  } catch (error) {
    console.error('Error analyzing photo:', error);
    return NextResponse.json(
      { error: 'Failed to analyze photo' },
      { status: 500 }
    );
  }
}
