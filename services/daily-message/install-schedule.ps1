# install-schedule.ps1
# Creates a Windows Scheduled Task to run effortless daily-message at 8:00 AM.

param(
    [int]$Hour = 8,
    [int]$Minute = 0,
    [string]$NodePath,
    [string]$CliPath,
    [string]$WorkingDir
)

$ErrorActionPreference = "Stop"
$TaskName = "effortless-daily-message"

$time = "{0:D2}:{1:D2}" -f $Hour, $Minute
Write-Host "Creating scheduled task '$TaskName' at $time daily..."

$action = New-ScheduledTaskAction `
    -Execute $NodePath `
    -Argument "`"$CliPath`" run-now" `
    -WorkingDirectory $WorkingDir

$trigger = New-ScheduledTaskTrigger -Daily -At $time

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable

$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Force | Out-Null

Write-Host "Task '$TaskName' registered. It will run daily at $time."
Write-Host "Test now with: node cli.js run-now"
