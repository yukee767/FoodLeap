param([ValidateSet("all","api","search","web")][string]$Only="all",[switch]$SkipBuild)
$RootDir=(Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
$ApiCfg=Join-Path $RootDir "apps/api-main/wrangler.toml"
$SearchCfg=Join-Path $RootDir "apps/search-service/wrangler.toml"
$WebCfg=Join-Path $RootDir "apps/web/wrangler.toml"
function Info($msg){Write-Host "[deploy] $msg" -ForegroundColor Green}
if(-not(Get-Command wrangler -ErrorAction SilentlyContinue)){Write-Host "[error] wrangler não encontrado" -ForegroundColor Red; exit 1}
wrangler --version
if($Only -eq "all" -or $Only -eq "api"){Info "Deploy foodleap-api..."; wrangler deploy --config $ApiCfg; Info "API → https://foodleap-api.victorlima124tt.workers.dev"}
if($Only -eq "all" -or $Only -eq "search"){Info "Deploy foodleap-search..."; wrangler deploy --config $SearchCfg; Info "Search → https://foodleap-search.victorlima124tt.workers.dev"}
if($Only -eq "all" -or $Only -eq "web"){Info "Deploy foodleap-web..."; if(-not $SkipBuild){npm run build:worker --workspace=@foodleap/web}; wrangler deploy --config $WebCfg; Info "Web → https://foodleap-web.victorlima124tt.workers.dev"}
Info "Deploy concluído! https://dash.cloudflare.com"
