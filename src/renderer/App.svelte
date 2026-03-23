<script lang="ts">
    // Hier importieren wir später unseren State
  </script>
  
  <div class="flex h-screen w-screen font-sans">
    <aside class="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-4 z-10 shadow-xl">
      <div class="text-xl font-bold tracking-wider text-slate-200 mb-4">RAILSIM</div>
      
      <div class="flex flex-col gap-2">
        <h2 class="text-xs uppercase text-slate-500 font-semibold tracking-widest">Modus</h2>
        <button class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-left transition-colors">Bauen</button>
        <button class="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-left transition-colors text-slate-400">Fahrdienstleiter</button>
      </div>
  
      <div class="flex flex-col gap-2 mt-4">
        <h2 class="text-xs uppercase text-slate-500 font-semibold tracking-widest">Werkzeuge</h2>
        <button class="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-left transition-colors">Gleis ziehen</button>
        <button class="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-left transition-colors">Bahnhof</button>
        <button class="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-left transition-colors">Signal</button>
      </div>
    </aside>
  
    <main class="flex-1 relative overflow-hidden bg-slate-950">
      <div class="absolute inset-0 flex items-center justify-center text-slate-700">
        Karten-Viewport (SVG)
      </div>
    </main>
  </div>