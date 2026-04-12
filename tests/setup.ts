import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock the Web Speech API
if (typeof window !== 'undefined') {
  window.speechSynthesis = {
    speak: vi.fn().mockImplementation((u) => console.log("MOCK: speechSynthesis.speak", !!u)),
    cancel: vi.fn().mockImplementation(() => console.log("MOCK: speechSynthesis.cancel")),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn().mockReturnValue([]),
    onvoiceschanged: null,
    pending: false,
    speaking: false,
    paused: false,
  } as any

  // @ts-ignore
  global.SpeechSynthesisUtterance = function (text) {
    this.text = text || "";
    this.lang = "";
    this.pitch = 1;
    this.rate = 1;
    this.voice = null;
    this.volume = 1;
    this.onend = null;
    this.onerror = null;
    this.onstart = null;
    this.onboundary = null;
    console.log("MOCK: SpeechSynthesisUtterance created with text:", this.text);
  };
}

// Mock URL.createObjectURL and URL.revokeObjectURL
if (typeof window !== 'undefined' && window.URL) {
  window.URL.createObjectURL = vi.fn().mockImplementation(() => {
    console.log("MOCK: URL.createObjectURL");
    return "blob:mock";
  });
  window.URL.revokeObjectURL = vi.fn().mockImplementation((url) => {
    console.log("MOCK: URL.revokeObjectURL", url);
  });
}

// Mock Audio
if (typeof window !== 'undefined') {
  global.Audio = vi.fn().mockImplementation(() => {
    console.log("MOCK: new Audio()");
    return {
      pause: vi.fn(),
      play: vi.fn().mockResolvedValue(undefined),
      src: '',
      currentTime: 0,
      removeAttribute: vi.fn(),
      onended: null,
      onerror: null,
    };
  }) as any
}
