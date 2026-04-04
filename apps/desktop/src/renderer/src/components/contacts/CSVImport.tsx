import { useState, useRef } from "react"
import { useContactStore } from "@/stores/contactStore"

interface CSVRow {
  [key: string]: string
}

const CRM_FIELDS = [
  { key: "first_name", label: "First Name" },
  { key: "last_name", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "company", label: "Company" },
]

export function CSVImport({ onClose }: { onClose: () => void }): JSX.Element {
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<CSVRow[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const saveContact = useContactStore((s) => s.saveContact)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split("\n").filter((l) => l.trim())
      if (lines.length < 2) return

      const csvHeaders = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
      setHeaders(csvHeaders)

      const csvRows = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""))
        const row: CSVRow = {}
        csvHeaders.forEach((h, i) => {
          row[h] = values[i] || ""
        })
        return row
      })
      setRows(csvRows)

      // Auto-map by name similarity
      const autoMap: Record<string, string> = {}
      for (const field of CRM_FIELDS) {
        const match = csvHeaders.find(
          (h) =>
            h.toLowerCase().replace(/[^a-z]/g, "") ===
            field.key.toLowerCase().replace(/[^a-z]/g, "")
        )
        if (match) autoMap[field.key] = match
      }
      setMapping(autoMap)
    }
    reader.readAsText(file)
  }

  const handleImport = async (): Promise<void> => {
    setImporting(true)
    for (const row of rows) {
      const contact: Record<string, string> = {}
      for (const [field, csvCol] of Object.entries(mapping)) {
        if (csvCol && row[csvCol]) {
          contact[field] = row[csvCol]
        }
      }
      if (contact.first_name) {
        await saveContact({ ...contact, source: "csv" })
      }
    }
    setImporting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Import CSV</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {headers.length === 0 ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-skydesk-500 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <svg className="w-10 h-10 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-500">Click or drag to upload CSV file</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFile}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              {rows.length} rows found. Map CSV columns to CRM fields:
            </p>

            {CRM_FIELDS.map((field) => (
              <div key={field.key} className="flex items-center gap-3">
                <label className="w-28 text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <select
                  value={mapping[field.key] || ""}
                  onChange={(e) =>
                    setMapping((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  className="flex-1 border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-skydesk-500"
                >
                  <option value="">— Skip —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importing || !mapping.first_name}
                className="flex-1 px-4 py-2 bg-skydesk-500 text-white rounded-lg hover:bg-skydesk-600 disabled:opacity-50"
              >
                {importing ? "Importing..." : `Import ${rows.length} contacts`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
