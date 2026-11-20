# Windows: o build nativo (ninja/CMake) estoura o limite de 260 caracteres no caminho do repositorio
# (OneDrive\Documentos\CondomiFacil\pocs\rm-16\p4). Subst e junction nao ajudam (o Gradle resolve o caminho real).
# Solucao: espelhar o codigo (sem node_modules/android) em um caminho curto e construir la.
# Uso: .\scripts\espelho.ps1 [-Destino C:\p4b]
param([string]$Destino = 'C:\p4b')
$origem = Join-Path $PSScriptRoot '..'
robocopy $origem $Destino /MIR /XD node_modules android ios .expo resultados /XF build.log | Out-Null
Push-Location $Destino
fnm exec --using 26.13.1 -- cmd /c "pnpm install --ignore-workspace --node-linker=hoisted"
Pop-Location
