import { useState, useRef, useCallback } from 'react'

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
    chunks.current = []

    recorder.ondataavailable = (e) => chunks.current.push(e.data)
    recorder.start(100)
    mediaRecorder.current = recorder
    setIsRecording(true)
    setDuration(0)
    timer.current = setInterval(() => setDuration((d) => d + 1), 1000)
  }, [])

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!mediaRecorder.current) return
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        resolve(blob)
      }
      mediaRecorder.current.stop()
      mediaRecorder.current.stream.getTracks().forEach((t) => t.stop())
      if (timer.current) clearInterval(timer.current)
      setIsRecording(false)
    })
  }, [])

  const cancelRecording = useCallback(() => {
    if (!mediaRecorder.current) return
    mediaRecorder.current.stop()
    mediaRecorder.current.stream.getTracks().forEach((t) => t.stop())
    if (timer.current) clearInterval(timer.current)
    setIsRecording(false)
    chunks.current = []
  }, [])

  return { isRecording, duration, startRecording, stopRecording, cancelRecording }
}
