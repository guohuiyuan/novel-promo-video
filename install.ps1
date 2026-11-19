$ErrorActionPreference = "Stop"
$src = Split-Path -Parent $MyInvocation.MyCommand.Path
$dst = Join-Path $HOME ".workbuddy\skills\novel-promo-video"
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $dst) | Out-Null
if (Test-Path $dst) { Remove-Item -Recurse -Force $dst }
New-Item -ItemType SymbolicLink -Path $dst -Target $src | Out-Null
Write-Host "[+] installed: $dst"
Write-Host "    restart the agent session to load the skill"
