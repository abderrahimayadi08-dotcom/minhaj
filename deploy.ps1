$dist = "C:\Users\DELL\Desktop\Nouveau dossier\minhaj\dist"
$blobs = @()

Get-ChildItem -Path $dist -Recurse -File | ForEach-Object {
  $relative = $_.FullName.Substring($dist.Length + 1).Replace('\', '/')
  $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
  $content = [Convert]::ToBase64String($bytes)
  
  $sha = gh api repos/abderrahimayadi08-dotcom/minhaj/git/blobs -X POST -f content=$content -f encoding=base64 --jq '.sha' 2>&1 | Out-String
  $sha = $sha.Trim()
  
  $blobs += @{
    path = $relative
    sha = $sha
    mode = "100644"
    type = "blob"
  }
  
  Write-Host "Uploaded: $relative -> $sha"
}

$treeJson = $blobs | ConvertTo-Json -Compress
Write-Host "Tree JSON length: $($treeJson.Length)"

# Create tree
$treeSha = gh api repos/abderrahimayadi08-dotcom/minhaj/git/trees -X POST -f tree=$treeJson --jq '.sha' 2>&1 | Out-String
$treeSha = $treeSha.Trim()
Write-Host "Tree SHA: $treeSha"

# Create commit
$commitSha = gh api repos/abderrahimayadi08-dotcom/minhaj/git/commits -X POST -f message="نشر: منهاج v1" -f tree=$treeSha --jq '.sha' 2>&1 | Out-String
$commitSha = $commitSha.Trim()
Write-Host "Commit SHA: $commitSha"

# Create gh-pages branch reference
gh api repos/abderrahimayadi08-dotcom/minhaj/git/refs -X POST -f ref="refs/heads/gh-pages" -f sha=$commitSha --jq '.ref' 2>&1
