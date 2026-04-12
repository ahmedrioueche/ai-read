import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import useReading from '@/hooks/useReading'
import { useSettings } from '@/context/SettingsContext'

// Bare minimum mocks
vi.mock('@/context/SettingsContext', () => ({
  useSettings: vi.fn(),
}))

vi.mock('@/utils/helper', () => ({
  formatLanguageToLocalCode: vi.fn().mockReturnValue('en-US'),
  preprocessText: vi.fn().mockImplementation(t => t),
}))

vi.mock('@/apis/voiceApi', () => ({
  default: class {
    textToSpeech = vi.fn().mockResolvedValue(new ArrayBuffer(8))
    getVoices = vi.fn().mockResolvedValue([])
    getWorkingApiKey = vi.fn().mockReturnValue('key')
  }
}))

vi.mock('@/lib/appAlerts', () => ({
  AppAlerts: class {
    sendErrorAlert = vi.fn()
    sendSuccessAlert = vi.fn()
  }
}))

describe('useReading Hook Isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useSettings as any).mockReturnValue({
      settings: {
        ttsType: 'basic',
        ttsVoice: { value: 'test' },
        bookLanguage: 'English'
      },
      updateSettings: vi.fn()
    })
  })

  it('should initialize', () => {
    const { result } = renderHook(() => useReading())
    expect(result.current.readingState).toBe('off')
  })

  it('should transition to reading', async () => {
    const { result } = renderHook(() => useReading())
    await act(async () => {
      result.current.readText('test')
    })
    expect(result.current.readingState).toBe('reading')
  })
})
