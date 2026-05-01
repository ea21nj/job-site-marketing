import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { imageData, description } = await request.json();

    console.log('📸 API received request with description:', description);
    console.log('Image data length:', imageData.length);

    // Extract image format and base64 data
    const imageMatch = imageData.match(/^data:image\/([a-z]+);base64,(.+)$/);
    if (!imageMatch) {
      console.error('❌ Failed to parse image format');
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400 }
      );
    }

    const imageFormat = imageMatch[1];
    const base64Image = imageMatch[2];
    const mediaType = `image/${imageFormat === 'jpg' ? 'jpeg' : imageFormat}`;
    console.log('✅ Detected image format:', mediaType);

    console.log('🔄 Calling Claude Vision API...');
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
                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `You are an expert construction marketing copywriter. Analyze this SPECIFIC construction/job site photo carefully and write a custom social media caption.

IMPORTANT: Your response must be completely custom based on what you SEE in the image. Do NOT use generic templates.

Look for and mention:
- The specific type of work visible (framing, excavation, roofing, finishing, mechanical, etc.)
- Materials visible (steel, concrete, wood, etc.)
- Progress stage of the project
- Quality indicators (neatness, organization, workmanship)
- Weather conditions if visible
- Any notable equipment or techniques

User's description: "${description}"

Write a 2-3 sentence professional, engaging caption that:
- References SPECIFIC details from the photo
- Sounds like a real construction company posting
- Includes 1 emoji if appropriate
- Is formatted for social media (Instagram/Facebook/LinkedIn)

Write ONLY the caption, nothing else.`,
            },
          ],
        },
      ],
    });

    const caption = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('✅ Claude response:', caption);

    return NextResponse.json({ caption });
  } catch (error) {
    console.error('❌ Error analyzing photo:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error details:', errorMessage);
    return NextResponse.json(
      { error: `Failed to analyze photo: ${errorMessage}` },
      { status: 500 }
    );
  }
}
