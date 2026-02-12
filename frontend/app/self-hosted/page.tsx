import Link from 'next/link';

export default function SelfHostedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-xl">
                  🖥️
                </div>
                <div>
                  <h1 className="text-xl font-bold">FabricMesh</h1>
                  <p className="text-xs text-gray-400">Self Hosted Solutions</p>
                </div>
              </Link>
            </div>
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <span>←</span>
              <span>Back to App</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Self-Hosted AI Agent</h1>
          <p className="text-xl text-gray-400">
            Run your own AI agent with local LLMs — no API costs, full privacy
          </p>
        </div>

        <section className="glass-card p-8 mb-8" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}>
          <h2 className="text-2xl font-bold mb-6">✅ Why Self-Host?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-pink-500 mt-2" />
                <div>
                  <h3 className="font-semibold">Zero API Costs</h3>
                  <p className="text-gray-400 text-sm">No $35-120/day LLM bills. Run models locally on your hardware.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-pink-500 mt-2" />
                <div>
                  <h3 className="font-semibold">Data Sovereignty</h3>
                  <p className="text-gray-400 text-sm">Your data never leaves your machine. Full privacy.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-pink-500 mt-2" />
                <div>
                  <h3 className="font-semibold">Custom Models</h3>
                  <p className="text-gray-400 text-sm">Choose any model — Qwen, DeepSeek, Llama, Mixtral.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-pink-500 mt-2" />
                <div>
                  <h3 className="font-semibold">No Rate Limits</h3>
                  <p className="text-gray-400 text-sm">Process as many requests as your hardware allows.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card p-8 mb-8" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}>
          <h2 className="text-2xl font-bold mb-6">💻 Hardware Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-yellow-500/30">
              <h3 className="font-bold text-yellow-400 mb-2">Minimum</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• 8 GB RAM</li>
                <li>• CPU only</li>
                <li>• 1.5B parameter models</li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-green-500/30">
              <h3 className="font-bold text-green-400 mb-2">Recommended</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• 16 GB RAM</li>
                <li>• 8GB VRAM GPU</li>
                <li>• 7B parameter models</li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-purple-500/30">
              <h3 className="font-bold text-purple-400 mb-2">Power User</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• 32+ GB RAM</li>
                <li>• RTX 3090/4090</li>
                <li>• 70B parameter models</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="glass-card p-8 mb-8" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}>
          <h2 className="text-2xl font-bold mb-6">🖥️ Setup Instructions</h2>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center font-bold">1</span>
                <h3 className="text-xl font-semibold">Install Ollama</h3>
              </div>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
                <p className="text-gray-400 mb-2"># macOS/Linux</p>
                <p className="text-green-400">curl -fsSL https://ollama.com/install.sh | sh</p>
                <p className="text-gray-400 mt-4 mb-2"># Start Ollama server</p>
                <p className="text-green-400">ollama serve</p>
              </div>
              <p className="text-gray-400 text-sm">
                Ollama runs as a background service. It will automatically start on boot.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center font-bold">2</span>
                <h3 className="text-xl font-semibold">Pull Recommended Models</h3>
              </div>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
                <p className="text-gray-400 mb-2"># Classifier (fast, small)</p>
                <p className="text-green-400">ollama pull qwen2.5:1.5b-instruct-q4_K_M</p>
                <p className="text-gray-400 mt-4 mb-2"># Code tasks (good quality)</p>
                <p className="text-green-400">ollama pull qwen2.5-coder:7b-instruct-q4_K_M</p>
                <p className="text-gray-400 mt-4 mb-2"># Complex reasoning (requires more VRAM)</p>
                <p className="text-green-400">ollama pull deepseek-coder-v2:16b-lite-instruct-q4_K_M</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center font-bold">3</span>
                <h3 className="text-xl font-semibold">Install ORZEU-4 (Optional)</h3>
              </div>
              <p className="text-gray-400">
                ORZEU-4 provides a Claude Code-like experience with local models, multi-model routing, and code execution.
              </p>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
                <p className="text-gray-400 mb-2"># Clone repository</p>
                <p className="text-green-400">git clone https://github.com/blazejkrzak/orzeu-4-cc.git</p>
                <p className="text-gray-400 mt-4 mb-2"># Build (requires Rust)</p>
                <p className="text-green-400">cd orzeu-4-cc/claude-code && cargo build --release</p>
                <p className="text-gray-400 mt-4 mb-2"># Run</p>
                <p className="text-green-400">./target/release/orzeu</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">
                  ⚠️ ORZEU-4 currently supports Polish language natively. English support is in development.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center font-bold">4</span>
                <h3 className="text-xl font-semibold">Configure Your Agent</h3>
              </div>
              <p className="text-gray-400">
                Connect your local Ollama instance to your OpenClaw agent:
              </p>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
                <p className="text-gray-400 mb-2"># In your agent credentials file:</p>
                <p className="text-green-400">OLLAMA_URL=http://localhost:11434</p>
                <p className="text-green-400">OLLAMA_MODEL=qwen2.5-coder:7b-instruct-q4_K_M</p>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card p-8 mb-8" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}>
          <h2 className="text-2xl font-bold mb-6">💾 Model Selection Guide</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4">Model</th>
                  <th className="text-left py-3 px-4">Size</th>
                  <th className="text-left py-3 px-4">Best For</th>
                  <th className="text-left py-3 px-4">Min VRAM</th>
                </tr>
              </thead>
              <tbody className="text-gray-400">
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono">qwen2.5:1.5b</td>
                  <td className="py-3 px-4">1 GB</td>
                  <td className="py-3 px-4">Classification, routing</td>
                  <td className="py-3 px-4">CPU only</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono">qwen2.5-coder:7b</td>
                  <td className="py-3 px-4">4 GB</td>
                  <td className="py-3 px-4">Code tasks, general chat</td>
                  <td className="py-3 px-4">6 GB</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono">deepseek-coder-v2:16b</td>
                  <td className="py-3 px-4">9 GB</td>
                  <td className="py-3 px-4">Complex architecture</td>
                  <td className="py-3 px-4">12 GB</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono">llama3.1:70b</td>
                  <td className="py-3 px-4">40 GB</td>
                  <td className="py-3 px-4">Best quality, reasoning</td>
                  <td className="py-3 px-4">48 GB</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass-card p-8 mb-8" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}>
          <h2 className="text-2xl font-bold mb-6">🧪 Quick Test</h2>
          <p className="text-gray-400 mb-4">
            Verify your setup is working:
          </p>
          <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
            <p className="text-green-400">curl http://localhost:11434/api/generate -d &apos;{`{ "model": "qwen2.5-coder:7b", "prompt": "Hello", "stream": false }`}&apos;</p>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            You should receive a JSON response with generated text.
          </p>
        </section>

        <section className="glass-card p-8" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}>
          <h2 className="text-2xl font-bold mb-6">📚 Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="https://ollama.com/library"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-2xl">⬇️</span>
              <div>
                <h3 className="font-semibold">Ollama Model Library</h3>
                <p className="text-sm text-gray-400">Browse available models</p>
              </div>
            </a>
            <a 
              href="https://github.com/blazejkrzak/orzeu-4-cc"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-2xl">🖥️</span>
              <div>
                <h3 className="font-semibold">ORZEU-4 Repository</h3>
                <p className="text-sm text-gray-400">Advanced agent runtime by blazejkrzak</p>
              </div>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
