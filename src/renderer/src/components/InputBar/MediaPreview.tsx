interface MediaFile {
  path: string
  name: string
  type: string
  previewUrl: string
}

interface Props {
  files: MediaFile[]
  onRemove: (index: number) => void
}

export function MediaPreview({ files, onRemove }: Props) {
  if (files.length === 0) return null

  return (
    <div className="flex gap-2 px-4 pt-3 flex-wrap">
      {files.map((file, i) => (
        <div key={i} className="relative">
          {file.type.startsWith('image/') ? (
            <img
              src={file.previewUrl}
              className="w-20 h-20 object-cover rounded-lg"
              alt={file.name}
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center text-xs text-gray-600 dark:text-gray-300 p-1">
              &#128196;
              <span className="truncate w-full text-center">{file.name}</span>
            </div>
          )}
          <button
            onClick={() => onRemove(i)}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  )
}
