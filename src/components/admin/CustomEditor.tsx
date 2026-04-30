'use client'

import { useState, useEffect, useRef } from 'react'

interface CustomEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

/**
 * Custom WYSIWYG/HTML Editor Component
 *
 * Features:
 * - Toggle between WYSIWYG and raw HTML modes
 * - Formatting toolbar (Bold, Italic, Underline, H2, H3, Lists, Links)
 * - Real-time content sync between modes
 * - Uses native contentEditable and document.execCommand
 */
export function CustomEditor({
  value,
  onChange,
  placeholder = '<p>Enter your HTML content here...</p>',
  minHeight = '400px'
}: CustomEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'wysiwyg' | 'html'>('wysiwyg')
  const [localHtml, setLocalHtml] = useState(value)

  // Sync external value changes
  useEffect(() => {
    setLocalHtml(value)
    if (mode === 'wysiwyg' && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value, mode])

  // Handle WYSIWYG input
  const handleWysiwygInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      setLocalHtml(newContent)
      onChange(newContent)
    }
  }

  // Handle HTML textarea input
  const handleHtmlInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setLocalHtml(newContent)
    onChange(newContent)
  }

  // Switch modes and sync content
  const switchMode = (newMode: 'wysiwyg' | 'html') => {
    if (newMode === 'wysiwyg' && editorRef.current) {
      // Switching to WYSIWYG - update the contenteditable
      editorRef.current.innerHTML = localHtml
    }
    setMode(newMode)
  }

  // Toolbar actions for WYSIWYG mode
  const execCommand = (command: string, cmdValue?: string) => {
    document.execCommand(command, false, cmdValue)
    editorRef.current?.focus()
    handleWysiwygInput()
  }

  const insertHeading = (level: number) => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const selectedText = range.toString() || 'Heading'
      const heading = document.createElement(`h${level}`)
      heading.textContent = selectedText
      range.deleteContents()
      range.insertNode(heading)
      handleWysiwygInput()
    }
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      execCommand('createLink', url)
    }
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Mode Toggle + Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
        {/* Left: Mode Toggle */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => switchMode('wysiwyg')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              mode === 'wysiwyg'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            WYSIWYG
          </button>
          <button
            type="button"
            onClick={() => switchMode('html')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              mode === 'html'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            HTML
          </button>
        </div>

        {/* Right: Formatting Toolbar (only in WYSIWYG mode) */}
        {mode === 'wysiwyg' && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => execCommand('bold')}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900"
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => execCommand('italic')}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900"
              title="Italic"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={() => execCommand('underline')}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900"
              title="Underline"
            >
              <u>U</u>
            </button>
            <span className="w-px h-4 mx-1 bg-gray-300" />
            <button
              type="button"
              onClick={() => insertHeading(2)}
              className="px-1.5 py-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 text-xs"
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertHeading(3)}
              className="px-1.5 py-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 text-xs"
              title="Heading 3"
            >
              H3
            </button>
            <span className="w-px h-4 mx-1 bg-gray-300" />
            <button
              type="button"
              onClick={() => execCommand('insertUnorderedList')}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900"
              title="Bullet List"
            >
              &bull;
            </button>
            <button
              type="button"
              onClick={() => execCommand('insertOrderedList')}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900"
              title="Numbered List"
            >
              1.
            </button>
            <span className="w-px h-4 mx-1 bg-gray-300" />
            <button
              type="button"
              onClick={insertLink}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900"
              title="Insert Link"
            >
              🔗
            </button>
          </div>
        )}
      </div>

      {/* Editor Area */}
      {mode === 'wysiwyg' ? (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleWysiwygInput}
          className="p-4 focus:outline-none prose prose-lg max-w-none"
          style={{
            backgroundColor: '#ffffff',
            color: '#000000',
            minHeight,
          }}
          suppressContentEditableWarning
        />
      ) : (
        <textarea
          value={localHtml}
          onChange={handleHtmlInput}
          className="w-full p-4 font-mono text-sm resize-y focus:outline-none bg-white text-gray-900"
          style={{ border: 'none', minHeight }}
          placeholder={placeholder}
          spellCheck={false}
        />
      )}
    </div>
  )
}

export default CustomEditor
