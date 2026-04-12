import { describe, it, expect, vi, beforeEach } from 'vitest'
import VoiceApi from '@/apis/voiceApi'
import axios from 'axios'

vi.mock('axios')
vi.mock('@/lib/appAlerts', () => ({
  AppAlerts: class {
    sendSuccessAlert = vi.fn()
    sendErrorAlert = vi.fn()
    sendNewVisitorAlert = vi.fn()
    sendNewUserAlert = vi.fn()
    sendUserLoginAlert = vi.fn()
    sendNewPaymentAlert = vi.fn()
    sendWarningAlert = vi.fn()
  }
}))

describe('VoiceApi', () => {
  let voiceApi: VoiceApi

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    // Reset static variables
    // @ts-ignore
    VoiceApi.workingApiKey = null
    
    process.env.NEXT_PUBLIC_ELEVENLABS_KEY_1 = 'key1'
    process.env.NEXT_PUBLIC_ELEVENLABS_KEY_2 = 'key2'
    voiceApi = new VoiceApi()
  })

  it('should rotate keys if the first one fails', async () => {
    // First key fails, second key succeeds
    ;(axios.post as any)
      .mockRejectedValueOnce(new Error('API Key Limit Reached'))
      .mockResolvedValueOnce({ 
        data: new ArrayBuffer(8),
        status: 200 
      })

    const result = await voiceApi.textToSpeech('test', 'voiceId')
    
    expect(result).toBeInstanceOf(ArrayBuffer)
    expect(axios.post).toHaveBeenCalledTimes(2)
    // Verify it stored the working key (second key)
    expect(voiceApi.getWorkingApiKey()).toBe('key2')
  })

  it('should throw error if all keys fail', async () => {
    ;(axios.post as any).mockRejectedValue(new Error('Total failure'))
    
    await expect(voiceApi.textToSpeech('test', 'voiceId'))
      .rejects.toThrow('No API keys available')
  })

  it('should reuse the working key for subsequent calls', async () => {
    // First call finds key2
    ;(axios.post as any)
      .mockRejectedValueOnce(new Error('Fail1'))
      .mockResolvedValue({ data: new ArrayBuffer(8) })

    await voiceApi.textToSpeech('test1', 'voiceId')
    expect(axios.post).toHaveBeenCalledTimes(2)
    expect(voiceApi.getWorkingApiKey()).toBe('key2')

    // Second call should use key2 immediately
    await voiceApi.textToSpeech('test2', 'voiceId')
    expect(axios.post).toHaveBeenCalledTimes(3)
  })
})
