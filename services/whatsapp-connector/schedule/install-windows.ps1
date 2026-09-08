# install-windows.ps1 — one Scheduled Task per job

param(
    [string]$JobId,
    [int]$Hour,
    [int]$Minute,
    [string]$NodePath,
    [string]$CliPath,
    [string]$WorkingDir
)

$ErrorActionPreference = "Stop"
$TaskName = "effortless-wa-$JobId"
$time = "{0:D2}:{1:D2}" -f $Hour, $Minute

Write-Host "Registering task '$TaskName' at $time daily..."

$action = New-ScheduledTaskAction `
    -Execute $NodePath `
    -Argument "`"$CliPath`" run-now $JobId" `
    -WorkingDirectory $WorkingDir

$trigger = New-ScheduledTaskTrigger -Daily -At $time
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
Write-Host "OK: $TaskName @ $time"
