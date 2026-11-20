# Roda os cenarios da P4 no emulador. Pre-requisitos: emulador ligado, APK instalado (expo run:android),
# servidor rodando (pnpm servidor). Uso: .\scripts\executar.ps1 [-Cenarios cifra,perf,...]
param([string[]]$Cenarios = @('cifra', 'queda', 'adr014', 'logout', 'perf'))
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$pkg = 'br.com.condomifacil.poc.p4'
$srv = 'http://localhost:4545'
$out = Join-Path $PSScriptRoot '..\resultados'

function Plano($nome) { Invoke-RestMethod "$srv/admin/plano" -Method Post -Body (@{nome = $nome } | ConvertTo-Json) -ContentType 'application/json' | Out-Null }
function Final($nome) { @(Invoke-RestMethod "$srv/admin/resultados" | Where-Object { $_.cenario -eq $nome -and $null -ne $_.ok }) }
function Esperar($nome, $antes, $seg = 600) {
    for ($i = 0; $i -lt $seg; $i++) {
        $r = Final $nome
        if ($r.Count -gt $antes) { return $r[-1] }
        Start-Sleep 1
    }
    throw "tempo esgotado: $nome"
}
function Iniciar { & $adb shell am start -n "$pkg/.MainActivity" | Out-Null }

Iniciar
foreach ($c in $Cenarios) {
    $antes = (Final $c).Count
    Plano $c
    $mem = Start-Job { param($adb, $pkg, $f) while ($true) { $l = & $adb shell dumpsys meminfo $pkg | Select-String 'TOTAL PSS'; "$([DateTime]::Now.ToString('HH:mm:ss')) $l" | Add-Content $f; Start-Sleep 2 } } -ArgumentList $adb, $pkg, (Join-Path $out "mem_$c.txt")
    $r = Esperar $c $antes
    Stop-Job $mem; Remove-Job $mem
    $r | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $out "$c.json") -Encoding utf8
    Write-Host "== $c"; $r | ConvertTo-Json -Depth 8
}
