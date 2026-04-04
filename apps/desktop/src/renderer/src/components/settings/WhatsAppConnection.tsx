import { useState } from "react"
import { useUIStore } from "@/stores/uiStore"
import type { WAConnectionState } from "@skydesk/shared"

export function WhatsAppConnection(): JSX.Element {
  const connectionInfo = useUIStore((s) => s.connectionInfo)
  const setConnectionInfo = useUIStore((s) => s.setConnectionInfo)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [showPairing, setShowPairing] = useState(false)

  const handleConnect = async (): Promise<void> => {
    setConnectionInfo({ state: "connecting" })
    await window.skydesk.wa.init()
  }

  const handleDisconnect = async (): Promise<void> => {
    await window.skydesk.wa.logout()
    setConnectionInfo({ state: "disconnected" })
  }

  const handleRequestPairing = async (): Promise<void> => {
    if (!phoneNumber.trim()) return
    const { code } = await window.skydesk.wa.requestPairing({ phoneNumber: phoneNumber.trim() })
    setConnectionInfo({ state: "pairing_code", pairingCode: code })
  }

  const renderState = (): JSX.Element => {
    const state = connectionInfo.state as WAConnectionState

    switch (state) {
      case "disconnected":
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Connect WhatsApp</h3>
            <p className="text-sm text-gray-500">
              Link your WhatsApp account to send and receive messages directly from SkyDesk CRM.
            </p>
            <button
              onClick={handleConnect}
              className="px-6 py-2 bg-skydesk-500 text-white rounded-lg hover:bg-skydesk-600 transition-colors"
            >
              Connect
            </button>
          </div>
        )

      case "qr_code":
        return (
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">Scan QR Code</h3>
            <p className="text-sm text-gray-500">
              Open WhatsApp on your phone → Settings → Linked Devices → Link a Device
            </p>
            {connectionInfo.qrCode && (
              <div className="inline-block p-4 bg-white rounded-xl shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(connectionInfo.qrCode)}`}
                  alt="QR Code"
                  className="w-64 h-64"
                />
              </div>
            )}
            <button
              onClick={() => setShowPairing(true)}
              className="text-sm text-skydesk-500 hover:underline"
            >
              Use pairing code instead
            </button>
          </div>
        )

      case "pairing_code":
        return (
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">Pairing Code</h3>
            {connectionInfo.pairingCode ? (
              <>
                <p className="text-sm text-gray-500">
                  Enter this code on your phone: WhatsApp → Linked Devices → Link with phone number
                </p>
                <div className="text-3xl font-mono font-bold tracking-widest text-skydesk-700">
                  {connectionInfo.pairingCode}
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500">Enter your phone number with country code</p>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="px-4 py-2 border rounded-lg text-center text-lg outline-none focus:border-skydesk-500"
                />
                <button
                  onClick={handleRequestPairing}
                  className="px-6 py-2 bg-skydesk-500 text-white rounded-lg hover:bg-skydesk-600 transition-colors"
                >
                  Get Code
                </button>
              </>
            )}
            <button
              onClick={() => {
                setShowPairing(false)
                handleConnect()
              }}
              className="text-sm text-skydesk-500 hover:underline"
            >
              Use QR code instead
            </button>
          </div>
        )

      case "connecting":
        return (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto border-4 border-skydesk-500 border-t-transparent rounded-full animate-spin" />
            <h3 className="text-lg font-medium">Connecting...</h3>
          </div>
        )

      case "connected":
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-green-700">Connected</h3>
            {connectionInfo.name && (
              <p className="text-sm text-gray-500">{connectionInfo.name}</p>
            )}
            {connectionInfo.jid && (
              <p className="text-xs text-gray-400">{connectionInfo.jid.split("@")[0]}</p>
            )}
            <button
              onClick={handleDisconnect}
              className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Disconnect
            </button>
          </div>
        )

      case "reconnecting":
        return (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            <h3 className="text-lg font-medium text-yellow-700">Reconnecting...</h3>
            <p className="text-sm text-gray-500">
              Attempt {connectionInfo.reconnectAttempt} of {connectionInfo.maxReconnectAttempts}
            </p>
          </div>
        )

      default: {
        const _exhaustive: never = state
        return <div>Unknown state</div>
      }
    }
  }

  if (showPairing && connectionInfo.state === "qr_code") {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <WhatsAppPairingInput
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            onRequest={handleRequestPairing}
            onBack={() => setShowPairing(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full">{renderState()}</div>
    </div>
  )
}

function WhatsAppPairingInput({
  phoneNumber,
  setPhoneNumber,
  onRequest,
  onBack,
}: {
  phoneNumber: string
  setPhoneNumber: (v: string) => void
  onRequest: () => void
  onBack: () => void
}): JSX.Element {
  return (
    <div className="text-center space-y-4">
      <h3 className="text-lg font-medium">Enter Phone Number</h3>
      <p className="text-sm text-gray-500">Enter your phone number with country code</p>
      <input
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="+1234567890"
        className="px-4 py-2 border rounded-lg text-center text-lg outline-none focus:border-skydesk-500"
      />
      <div className="flex gap-2 justify-center">
        <button onClick={onBack} className="px-4 py-2 text-gray-500 hover:underline text-sm">
          Back to QR
        </button>
        <button
          onClick={onRequest}
          className="px-6 py-2 bg-skydesk-500 text-white rounded-lg hover:bg-skydesk-600 transition-colors"
        >
          Get Pairing Code
        </button>
      </div>
    </div>
  )
}
