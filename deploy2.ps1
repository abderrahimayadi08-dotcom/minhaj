$dist = "C:\Users\DELL\Desktop\Nouveau dossier\minhaj\dist"
$repo = "abderrahimayadi08-dotcom/minhaj"

Write-Host "Getting current commit SHA..."
$currentSha = gh api repos/$repo/git/refs/heads/main --jq '.object.sha' 2>&1 | Out-String
$currentSha = $currentSha.Trim()
Write-Host "Current SHA: $currentSha"

Get-ChildItem -Path $dist -Recurse -File | ForEach-Object {
  $relative = $_.FullName.Substring($dist.Length + 1).Replace('\', '/')
  Write-Host "Uploading: $relative ..."
  $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
  $content = [Convert]::ToBase64String($bytes)
  $json = @{message="Add $relative";content=$content;branch="main"} | ConvertTo-Json -Compress
  $result = $json | gh api repos/$repo/contents/$relative -X PUT --input - --jq '.commit.sha' 2>&1 | Out-String
  $currentSha = $result.Trim()
  Write-Host "  -> $currentSha"
}
