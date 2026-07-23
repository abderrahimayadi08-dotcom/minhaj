$dist = "C:\Users\DELL\Desktop\Nouveau dossier\minhaj\dist"
$repo = "abderrahimayadi08-dotcom/minhaj"

$existing = @{
  "index.html" = "bf13a6e0269029ec527261191bd1ad929aedf914"
  "manifest.json" = "d98539252049ee699a9959cb9a153e1ffc47ba0a"
}

$files = @(
  "index.html",
  "manifest.json"
)

Write-Host "=== Updating files on main ==="
foreach ($f in $files) {
  $path = Join-Path -Path $dist -ChildPath $f
  $written = Test-Path -LiteralPath $path
  if (-not $written) {
    Write-Host "SKIP: $f (not found)"
    continue
  }
  $bytes = [System.IO.File]::ReadAllBytes($path)
  $content = [Convert]::ToBase64String($bytes)
  $sha = $existing[$f]
  $json = @{message="update $f";content=$content;sha=$sha;branch="main"} | ConvertTo-Json -Compress
  $result = $json | gh api repos/$repo/contents/$f -X PUT --input - --jq '.commit.sha' 2>&1 | Out-String
  $hash = $result.Trim()
  Write-Host "UPDATED: $f -> $hash"
}

# Now update gh-pages to point to the same HEAD as main
Write-Host "=== Updating gh-pages ref ==="
$mainSha = gh api repos/$repo/git/refs/heads/main --jq '.object.sha' 2>&1 | Out-String
$mainSha = $mainSha.Trim()
Write-Host "Main HEAD: $mainSha"

$json = @{sha=$mainSha;force=$true} | ConvertTo-Json -Compress
$result = $json | gh api repos/$repo/git/refs/heads/gh-pages -X PATCH --input - --jq '.ref' 2>&1 | Out-String
Write-Host "gh-pages updated: $($result.Trim())"
