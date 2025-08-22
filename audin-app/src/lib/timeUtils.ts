// Utility functions for natural time conversion

const timeWords: { [key: string]: string } = {
  '0': 'twelve',
  '1': 'one',
  '2': 'two', 
  '3': 'three',
  '4': 'four',
  '5': 'five',
  '6': 'six',
  '7': 'seven',
  '8': 'eight',
  '9': 'nine',
  '10': 'ten',
  '11': 'eleven',
  '12': 'twelve',
  '13': 'one',
  '14': 'two',
  '15': 'three',
  '16': 'four',
  '17': 'five',
  '18': 'six',
  '19': 'seven',
  '20': 'eight',
  '21': 'nine',
  '22': 'ten',
  '23': 'eleven'
};

const minuteWords: { [key: string]: string } = {
  '00': '',
  '05': 'oh-five',
  '10': 'ten',
  '15': 'fifteen',
  '20': 'twenty',
  '25': 'twenty-five',
  '30': 'thirty',
  '35': 'thirty-five',
  '40': 'forty',
  '45': 'forty-five',
  '50': 'fifty',
  '55': 'fifty-five'
};

// Convert time string to natural podcast format
export function convertTimeToNatural(timeString: string): string {
  try {
    const date = new Date(`2000-01-01 ${timeString}`);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Handle special cases
    if (hours === 12 && minutes === 0) {
      return 'noon';
    }
    if (hours === 0 && minutes === 0) {
      return 'midnight';
    }
    
    // Convert hours (handle 24-hour format)
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const hourWord = timeWords[hour12.toString()];
    
    // Handle minutes
    if (minutes === 0) {
      return hourWord;
    }
    
    // Try exact minute match first
    const minuteKey = minutes.toString().padStart(2, '0');
    if (minuteWords[minuteKey]) {
      return `${hourWord} ${minuteWords[minuteKey]}`;
    }
    
    // For other minutes, convert to words
    if (minutes < 10) {
      return `${hourWord} oh-${timeWords[minutes.toString()]}`;
    } else {
      const tens = Math.floor(minutes / 10);
      const ones = minutes % 10;
      if (ones === 0) {
        return `${hourWord} ${timeWords[(tens * 10).toString()]}`;
      } else {
        return `${hourWord} ${timeWords[(tens * 10).toString()]}-${timeWords[ones.toString()]}`;
      }
    }
  } catch (error) {
    console.error('Error converting time:', error);
    return timeString; // Fallback to original
  }
}

// Convert duration to natural format
export function convertDurationToNatural(duration: string): string {
  // Handle common patterns like "30m", "1h", "1h 30m"
  if (duration.includes('h') && duration.includes('m')) {
    const parts = duration.split(' ');
    const hours = parts[0].replace('h', '');
    const minutes = parts[1].replace('m', '');
    
    if (minutes === '0' || minutes === '00') {
      return `${hours} hour${hours === '1' ? '' : 's'}`;
    } else {
      return `${hours} hour${hours === '1' ? '' : 's'} and ${minutes} minutes`;
    }
  } else if (duration.includes('h')) {
    const hours = duration.replace('h', '');
    return `${hours} hour${hours === '1' ? '' : 's'}`;
  } else if (duration.includes('m')) {
    const minutes = duration.replace('m', '');
    return `${minutes} minutes`;
  }
  
  return duration; // Fallback
}
