# start-whatsapp-cdp.ps1
# Restart WhatsApp Desktop (Microsoft Store) with WebView2 CDP on port 9222.
# Personal bridge — one machine, one account, $0.

$ErrorActionPreference = "Stop"

$Aumid = "5319275A.WhatsAppDesktop_cv1g1gvanyjgm!App"
$StoreId = "5319275A.WhatsAppDesktop"
$CdpPort = 9222
$CdpUrl = "http://127.0.0.1:$CdpPort/json/version"
$MaxWaitSec = 45

function Test-CdpUp {
    try {
        $r = Invoke-WebRequest -Uri $CdpUrl -UseBasicParsing -TimeoutSec 3
        return $r.StatusCode -eq 200
    } catch {
        return $false
    }
}

function Stop-WhatsAppDesktop {
    Write-Host "Stopping WhatsApp Desktop..."
    Get-Process -Name "WhatsApp" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2

    # Also try via AppId
    $shell = New-Object -ComObject Shell.Application
    $null = $shell
}

function Start-WhatsAppWithCdp {
    Write-Host "Setting WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS for user..."
    [Environment]::SetEnvironmentVariable(
        "WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS",
        "--remote-debugging-port=$CdpPort",
        "User"
    )

    Write-Host "Launching WhatsApp Desktop ($Aumid)..."
    Start-Process "shell:AppsFolder\$Aumid"
}

function Clear-WebView2Env {
    Write-Host "Clearing WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS..."
    [Environment]::SetEnvironmentVariable(
        "WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS",
        $null,
        "User"
    )
}

# --- Main ---

if (Test-CdpUp) {
    Write-Host "CDP already up on port $CdpPort."
    exit 0
}

Stop-WhatsAppDesktop
Start-WhatsAppWithCdp

$elapsed = 0
while ($elapsed -lt $MaxWaitSec) {
    Start-Sleep -Seconds 2
    $elapsed += 2
    if (Test-CdpUp) {
        Write-Host "CDP is up on port $CdpPort after ${elapsed}s."
        Clear-WebView2Env
        exit 0
    }
    Write-Host "Waiting for CDP... (${elapsed}s)"
}

Clear-WebView2Env
Write-Host "ERROR: CDP did not come up within ${MaxWaitSec}s."
exit 1
