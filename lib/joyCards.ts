import { DailyPromptResponse } from './dailyPrompts';

export interface JoyCardTemplate {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  backgroundPattern?: string;
}

export interface JoyCardData {
  prompt: string;
  response: string;
  userName?: string;
  date: string;
  template: JoyCardTemplate;
}

// Predefined card templates
export const JOY_CARD_TEMPLATES: JoyCardTemplate[] = [
  {
    id: 'sunset',
    name: 'Sunset Joy',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    accentColor: '#ffd700',
    fontFamily: 'Inter, sans-serif'
  },
  {
    id: 'ocean',
    name: 'Ocean Calm',
    backgroundColor: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
    textColor: '#ffffff',
    accentColor: '#00cec9',
    fontFamily: 'Inter, sans-serif'
  },
  {
    id: 'sunshine',
    name: 'Sunshine',
    backgroundColor: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
    textColor: '#2d3436',
    accentColor: '#ffffff',
    fontFamily: 'Inter, sans-serif'
  },
  {
    id: 'lavender',
    name: 'Lavender Dreams',
    backgroundColor: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
    textColor: '#ffffff',
    accentColor: '#fd79a8',
    fontFamily: 'Inter, sans-serif'
  },
  {
    id: 'forest',
    name: 'Forest Peace',
    backgroundColor: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
    textColor: '#ffffff',
    accentColor: '#fdcb6e',
    fontFamily: 'Inter, sans-serif'
  }
];

// Generate a Joy Card image
export async function generateJoyCard(cardData: JoyCardData): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      resolve('');
      return;
    }

    // Set canvas size for Instagram Stories (1080x1920)
    canvas.width = 1080;
    canvas.height = 1920;

    const template = cardData.template;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (template.backgroundColor.includes('gradient')) {
      // Parse gradient colors
      const colors = template.backgroundColor.match(/#[a-fA-F0-9]{6}/g) || ['#667eea', '#764ba2'];
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[1]);
    } else {
      gradient.addColorStop(0, template.backgroundColor);
      gradient.addColorStop(1, template.backgroundColor);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle pattern overlay
    if (template.backgroundPattern) {
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = template.accentColor;
      for (let i = 0; i < canvas.width; i += 100) {
        for (let j = 0; j < canvas.height; j += 100) {
          ctx.beginPath();
          ctx.arc(i, j, 2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    // Add decorative elements
    ctx.fillStyle = template.accentColor;
    ctx.globalAlpha = 0.3;
    
    // Top left circle
    ctx.beginPath();
    ctx.arc(100, 200, 80, 0, 2 * Math.PI);
    ctx.fill();
    
    // Bottom right circle
    ctx.beginPath();
    ctx.arc(canvas.width - 100, canvas.height - 200, 120, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.globalAlpha = 1;

    // Add content
    const centerX = canvas.width / 2;
    let currentY = 400;

    // Add prompt text
    ctx.fillStyle = template.textColor;
    ctx.font = 'bold 48px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    // Wrap text for prompt
    const promptLines = wrapText(ctx, cardData.prompt, canvas.width - 200, 48);
    promptLines.forEach(line => {
      ctx.fillText(line, centerX, currentY);
      currentY += 60;
    });

    currentY += 80;

    // Add response text
    ctx.font = '36px Inter, sans-serif';
    const responseLines = wrapText(ctx, cardData.response, canvas.width - 200, 36);
    responseLines.forEach(line => {
      ctx.fillText(line, centerX, currentY);
      currentY += 50;
    });

    currentY += 100;

    // Add date
    ctx.font = '24px Inter, sans-serif';
    ctx.fillStyle = template.accentColor;
    ctx.fillText(cardData.date, centerX, currentY);

    currentY += 60;

    // Add user name if provided
    if (cardData.userName) {
      ctx.font = '28px Inter, sans-serif';
      ctx.fillStyle = template.textColor;
      ctx.fillText(`— ${cardData.userName}`, centerX, currentY);
    }

    // Add app branding at bottom
    ctx.font = '20px Inter, sans-serif';
    ctx.fillStyle = template.textColor;
    ctx.globalAlpha = 0.7;
    ctx.fillText('Shared with joy via HappyMe+', centerX, canvas.height - 100);
    ctx.globalAlpha = 1;

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png');
    resolve(dataUrl);
  });
}

// Helper function to wrap text
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

// Download the generated card
export function downloadJoyCard(dataUrl: string, fileName: string = 'joy-card.png'): void {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Share to social media
export function shareJoyCard(dataUrl: string, text: string = 'Check out my joy today!'): void {
  if (navigator.share) {
    // Use native sharing if available
    navigator.share({
      title: 'My Joy Today',
      text: text,
      url: window.location.origin
    });
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(text + '\n' + window.location.origin);
    alert('Link copied to clipboard!');
  }
}

// Create Joy Card from daily prompt response
export async function createJoyCardFromResponse(
  response: DailyPromptResponse,
  templateId: string = 'sunset'
): Promise<string> {
  const template = JOY_CARD_TEMPLATES.find(t => t.id === templateId) || JOY_CARD_TEMPLATES[0];
  
  const cardData: JoyCardData = {
    prompt: response.promptText,
    response: response.response,
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    template
  };

  return generateJoyCard(cardData);
}
