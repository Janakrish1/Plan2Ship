/**
 * Azure OpenAI DALL-E 3 image generation for Stage 4 wireframe mockups.
 * Uses AZURE_OPENAI_IMAGE_GENERATION_* env vars.
 */

const ENDPOINT = process.env.AZURE_OPENAI_IMAGE_GENERATION_ENDPOINT;
const API_KEY = process.env.AZURE_OPENAI_IMAGE_GENERATION_API_KEY;

export interface WireframePrompt {
  screenName: string;
  purpose: string;
  components: string[];
  microcopy: string[];
}

const VARIATION_STYLES = [
  'minimal clean layout',
  'bold modern layout',
  'different color scheme and spacing',
  'alternative arrangement of sections',
  'fresh take with new visual hierarchy',
  'another variation with different styling',
];

export function buildWireframePrompt(
  w: WireframePrompt,
  variationHint?: string
): string {
  const parts = [
    'A single webpage design. One full web page only — real website as seen in a browser. Flat, straight-on view only: no tilt, no angle, no isometric perspective, no 3D. The page must be perfectly flat and front-facing like a screenshot.',
    `Screen: "${w.screenName}". ${w.purpose}.`,
  ];
  if (variationHint) {
    parts.push(`Create a distinct variation: ${variationHint}.`);
  }
  if (w.components?.length) {
    parts.push(
      `Include: ${w.components.join(', ')}. ` +
      'Clear layout and sections like a real live website.'
    );
  }
  if (w.microcopy?.length) {
    parts.push(
      `Use this text where relevant: ${w.microcopy.slice(0, 6).join(' | ')}.`
    );
  }
  parts.push(
    'CRITICAL: (1) No tilt, no perspective, no isometric — completely flat, straight-on webpage like a browser screenshot. (2) No background: no green, no teal, no colored area outside the page. The webpage itself must fill the entire image edge to edge with no border, no margin, no empty space, no visible background around it. (3) Do NOT show Figma, design software, artboards, or wireframe grid. Pure webpage only. Modern, clean, professional.'
  );
  return parts.join(' ');
}

export function getRandomVariationHint(): string {
  return VARIATION_STYLES[Math.floor(Math.random() * VARIATION_STYLES.length)];
}

/**
 * Call Azure DALL-E 3 image generations API and return the image as a Buffer.
 */
export async function generateImage(prompt: string): Promise<Buffer> {
  if (!ENDPOINT || !API_KEY) {
    throw new Error(
      'AZURE_OPENAI_IMAGE_GENERATION_ENDPOINT and AZURE_OPENAI_IMAGE_GENERATION_API_KEY must be set'
    );
  }

  const body = {
    prompt,
    n: 1,
    size: '1024x1024' as const,
    quality: 'standard' as const,
    style: 'natural' as const,
    response_format: 'b64_json' as const,
  };

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    const msg = (err as { error?: { message?: string; code?: string } }).error?.message ?? res.statusText;
    throw new Error(`Image generation failed: ${msg}`);
  }

  const data = (await res.json()) as {
    data?: { b64_json?: string; url?: string }[];
    error?: { code?: string; message?: string };
  };

  if (data.error) {
    throw new Error(data.error.message ?? 'Image generation failed');
  }

  const first = data.data?.[0];
  if (!first) {
    throw new Error('No image data in response');
  }

  if (first.b64_json) {
    return Buffer.from(first.b64_json, 'base64');
  }

  if (first.url) {
    const imgRes = await fetch(first.url);
    if (!imgRes.ok) throw new Error('Failed to fetch generated image URL');
    const arrayBuffer = await imgRes.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  throw new Error('Response contained no image (b64_json or url)');
}
