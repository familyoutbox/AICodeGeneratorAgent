import { useState, useEffect } from 'react'
import { Code2, Download, Loader2, Sparkles, Copy, Check, ChevronDown, ChevronRight, Globe, Server, Smartphone, Terminal, BarChart3, Box, Cloud, GitBranch, Layers } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface TechStack {
  id: string
  name: string
  category: string
  icon: string
  description: string
  frameworks: string[]
}

interface GeneratedFile {
  path: string
  content: string
  language: string
}

interface GenerateResult {
  files: GeneratedFile[]
  summary: string
  stack: string
}

const iconMap: Record<string, React.ReactNode> = {
  Globe: <Globe className="w-5 h-5" />,
  Server: <Server className="w-5 h-5" />,
  Smartphone: <Smartphone className="w-5 h-5" />,
  Terminal: <Terminal className="w-5 h-5" />,
  BarChart3: <BarChart3 className="w-5 h-5" />,
  Box: <Box className="w-5 h-5" />,
  Cloud: <Cloud className="w-5 h-5" />,
  GitBranch: <GitBranch className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
}

const categoryColors: Record<string, string> = {
  Frontend: 'border-blue-500 bg-blue-500/10 text-blue-400',
  Backend: 'border-green-500 bg-green-500/10 text-green-400',
  Mobile: 'border-purple-500 bg-purple-500/10 text-purple-400',
  'Scripts & CLI': 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
  'Data & ML': 'border-red-500 bg-red-500/10 text-red-400',
  DevOps: 'border-orange-500 bg-orange-500/10 text-orange-400',
  Fullstack: 'border-cyan-500 bg-cyan-500/10 text-cyan-400',
}

function FileViewer({ file, isOpen, onToggle }: { file: GeneratedFile; isOpen: boolean; onToggle: () => void }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(file.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          <Code2 className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-mono text-gray-200">{file.path}</span>
        </div>
        <span className="text-xs text-gray-500 uppercase">{file.language}</span>
      </button>
      {isOpen && (
        <div className="relative">
          <button
            onClick={copyToClipboard}
            className="absolute top-2 right-2 z-10 p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-300" />}
          </button>
          <SyntaxHighlighter
            language={file.language}
            style={oneDark}
            customStyle={{ margin: 0, borderRadius: 0, fontSize: '13px' }}
            showLineNumbers
          >
            {file.content}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  )
}

function App() {
  const [stacks, setStacks] = useState<TechStack[]>([])
  const [selectedStack, setSelectedStack] = useState<string>('')
  const [selectedFramework, setSelectedFramework] = useState<string>('')
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openFiles, setOpenFiles] = useState<Set<number>>(new Set())
  const [activeCategory, setActiveCategory] = useState<string>('All')

  useEffect(() => {
    fetch(`${API_URL}/api/stacks`)
      .then(res => res.json())
      .then(data => setStacks(data.stacks))
      .catch(() => setError('Failed to load tech stacks'))
  }, [])

  const categories = ['All', ...Array.from(new Set(stacks.map(s => s.category)))]
  const filteredStacks = activeCategory === 'All' ? stacks : stacks.filter(s => s.category === activeCategory)
  const currentStack = stacks.find(s => s.id === selectedStack)

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedStack) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          stack: selectedStack,
          framework: selectedFramework || undefined,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || 'Generation failed')
      }

      const data = await res.json()
      setResult(data)
      setOpenFiles(new Set([0]))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!result) return

    try {
      const res = await fetch(`${API_URL}/api/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          stack: selectedStack,
          framework: selectedFramework || undefined,
        }),
      })

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'generated-project.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Download failed')
    }
  }

  const toggleFile = (index: number) => {
    setOpenFiles(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI Code Generator
              </h1>
              <p className="text-xs text-gray-500">Generate production-ready code for any tech stack</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel: Stack Selection & Prompt */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tech Stack Selector */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-400" />
                Select Tech Stack
              </h2>

              {/* Category tabs */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      activeCategory === cat
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Stack grid */}
              <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                {filteredStacks.map(stack => (
                  <button
                    key={stack.id}
                    onClick={() => {
                      setSelectedStack(stack.id)
                      setSelectedFramework('')
                    }}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedStack === stack.id
                        ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/50'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={selectedStack === stack.id ? 'text-blue-400' : 'text-gray-400'}>
                        {iconMap[stack.icon] || <Code2 className="w-5 h-5" />}
                      </span>
                      <span className="text-sm font-medium truncate">{stack.name}</span>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${categoryColors[stack.category] || 'border-gray-600 text-gray-400'}`}>
                      {stack.category}
                    </span>
                  </button>
                ))}
              </div>

              {/* Framework selector */}
              {currentStack && currentStack.frameworks.length > 0 && (
                <div className="mt-4">
                  <label className="text-sm text-gray-400 mb-2 block">Framework (optional)</label>
                  <select
                    value={selectedFramework}
                    onChange={e => setSelectedFramework(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Auto-detect</option>
                    {currentStack.frameworks.map(fw => (
                      <option key={fw} value={fw}>{fw}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Prompt Input */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Describe Your Project
              </h2>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g., Build a REST API with user authentication, CRUD operations for blog posts, and JWT token management..."
                className="w-full h-40 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim() || !selectedStack}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/25"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Code
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Output */}
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gray-800 flex items-center justify-center mb-6">
                  <Code2 className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Ready to Generate</h3>
                <p className="text-gray-500 text-sm max-w-md">
                  Select a tech stack, describe your project, and click Generate to create production-ready code instantly.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-6" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Generating Your Code...</h3>
                <p className="text-gray-500 text-sm">AI is crafting production-ready code for your project</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Summary bar */}
                <div className="flex items-center justify-between bg-gray-900 rounded-xl border border-gray-800 p-4">
                  <div>
                    <p className="text-sm text-gray-300">{result.summary}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {result.files.length} file{result.files.length !== 1 ? 's' : ''} generated
                    </p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download ZIP
                  </button>
                </div>

                {/* File list */}
                <div className="space-y-2">
                  {result.files.map((file, index) => (
                    <FileViewer
                      key={file.path}
                      file={file}
                      isOpen={openFiles.has(index)}
                      onToggle={() => toggleFile(index)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
