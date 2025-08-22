/**
 * TTS Preprocessor - Converts script markers into punctuation and spacing
 * that TTS engines (especially ElevenLabs) respond to for better prosody
 */

export function prepareForTTS(input: string): string {
  return input
    // Pause markers → punctuation ElevenLabs respects
    .replace(/\[PAUSE:long\]/g, '\n\n')     // big transition = paragraph break
    .replace(/\[PAUSE:short\]/g, ',')       // small breath = comma

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
