/**
 * TTS Preprocessor - Converts script markers into punctuation and spacing
 * that TTS engines (especially ElevenLabs) respond to for better prosody
 */

export function prepareForTTS(input: string): string {
  return input
    // Pause markers → punctuation ElevenLabs respects  
    .replace(/\[PAUSE:long\]/g, '... ')     // long pause = ellipsis + space (more natural)
    .replace(/\[PAUSE:short\]/g, ', ')      // short pause = comma + space

    // Fix any remaining numeric time formats that slipped through
    .replace(/\b(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)\b/g, (match, hour, minute, period) => {
      const hourWord = convertNumberToWord(parseInt(hour));
      const minuteWord = minute === '00' ? '' : ' ' + convertNumberToWord(parseInt(minute));
      return `${hourWord}${minuteWord} ${period.toLowerCase()}`;
    })
    
    // Convert standalone times like "3:00" to "three"
    .replace(/\b(\d{1,2}):00\b/g, (match, hour) => convertNumberToWord(parseInt(hour)))

    // Emphasis: keep *word* but make it ", word," with em dashes for stronger beats
    .replace(/\*(.+?)\*/g, '— $1 —')

    // Normalize repeated spaces/newlines
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')

    // Gentle cue: if a stage direction is at start of sentence, follow with a comma
    .replace(/\((warm|brighter|matter-of-fact|quick smile|soft|energetic)\)\s*/gi, '($1), ')

    // Avoid double punctuation like ",." or ",,"
    .replace(/([,.—…])([,.—…]+)/g, '$1')

    // Keep paragraphs; ensure sentences end with punctuation for cadence
    .replace(/([a-zA-Z0-9\)\]])\n\n/g, '$1.\n\n')
    
    // Clean up any leading/trailing whitespace
    .trim();
}

// Helper function to convert numbers to words for times
function convertNumberToWord(num: number): string {
  const numbers: { [key: number]: string } = {
    1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six',
    7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve',
    13: 'thirteen', 14: 'fourteen', 15: 'fifteen', 16: 'sixteen', 17: 'seventeen',
    18: 'eighteen', 19: 'nineteen', 20: 'twenty', 30: 'thirty', 40: 'forty', 50: 'fifty'
  };
  
  if (numbers[num]) return numbers[num];
  if (num > 20 && num < 60) {
    const tens = Math.floor(num / 10) * 10;
    const ones = num % 10;
    return `${numbers[tens]}-${numbers[ones]}`;
  }
  return num.toString(); // fallback
}

/**
 * Optional: Split text by paragraphs for segmented synthesis
 * This can help maintain better pacing for longer scripts
 */
export function splitByParagraphs(text: string): string[] {
  return text
    .split('\n\n')
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0);
}
