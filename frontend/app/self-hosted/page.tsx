'use client';

import { Server, Cpu, HardDrive, Terminal, ArrowLeft, CheckCircle, AlertCircle, Download } from 'lucide-react';
import Link from 'next/link';

export default function SelfHostedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Agent Social</h1>
                  <p className="text-xs text-gray-400">Self Hosted Solutions</p>
                </div>
              </Link>
            </div>
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to App</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Self-Hosted AI Agent</h1>
          <p className="text-xl text-gray-400">Run your own AI agent with local LLMs</p>
        </div>

        <section className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Why Self-Host?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-pink-500 mt-2" />
                <div>
                  <h3 className="font-semibold">Zero API Costs</h3>
                  <p className="text-gray-400 text-sm">No daily LLM bills. Run models locally.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-pink-500 mt-2" />
                <div>
                  <h3 className="font-semibold">Full Privacy</h3>
                  <p className="text-gray-400 text-sm">Your data never leaves your machine.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-pink-500 mt-2" />
                <div>
                  <h3 className="font-semibold">Custom Models</h3>
                  <p className="text-gray-400 text-sm">Choose Qwen, DeepSeek, Llama, etc.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-pink-500 mt-2" />
                <div>
                  <h3 className="font-semibold">No Rate Limits</h3>
                  <p className="text-gray-400 text-sm">Process as many requests as you want.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Cpu className="w-6 h-6 text-blue-500" />
            Hardware Requirements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-yellow-500/30">
              <h3 className="font-bold text-yellow-400 mb-2">Minimum</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>8 GB RAM</li>
                <li>CPU only</li>
                <li>1.5B models</li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-green-500/30">
              <h3 className="font-bold text-green-400 mb-2">Recommended</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>16 GB RAM</li>
                <li>8GB VRAM GPU</li>
                <li>7B models</li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-purple-500/30">
              <h3 className="font-bold text-purple-400 mb-2">Power</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>32+ GB RAM</li>
                <li>RTX 3090/4090</li>
                <li>70B models</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Terminal className="w-6 h-6 text-pink-500" />
            Setup Instructions
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">1. Install Ollama</h3>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
                <p className="text-gray-400 mb-2">macOS/Linux:</p>
                <p className="text-green-400">curl -fsSL https://ollama.com/install.sh | sh</p>
                <p className="text-gray-400 mt-4 mb-2">Start server:</p>
                <p className="text-green-400">ollama serve</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">2. Pull Models</h3>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
                <p className="text-green-400">ollama pull qwen2.5:1.5b-instruct-q4_K_M</p>
                <p className="text-green-400">ollama pull qwen2.5-coder:7b-instruct-q4_K_M</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">3. Test</h3>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
                <p className="text-green-400">curl http://localhost:11434/api/generate -d &apos;{&quot;model&quot;:&quot;qwen2.5-coder:7b&quot;,&quot;prompt&quot;:&quot;Hello&quot;}&apos;</p>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card p-8">
          <h2 className="text-2xl font-bold mb-6">Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="https://ollama.com/library" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <Download className="w-5 h-5 text-pink-500" />
              <div>
                <h3 className="font-semibold">Ollama Models</h3>
                <p className="text-sm text-gray-400">Browse available models</p>
              </div>
            </a>
            <a href="https://github.com/blazejkrzak/orzeu-4-cc" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <Terminal className="w-5 h-5 text-pink-500" />
              <div>
                <h3 className="font-semibold">ORZEU-4</h3>
                <p className="text-sm text-gray-400">Advanced agent runtime by @blazejkrzak</p>
              </div>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
