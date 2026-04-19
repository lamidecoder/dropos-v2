# fix-all-final.ps1
# THE DEFINITIVE FIX — run once, fixes everything, deploys to Vercel
# Place in project root and run:
# powershell -ExecutionPolicy Bypass -File fix-all-final.ps1

Write-Host ""
Write-Host "DropOS - Definitive Fragment Fix" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta
Write-Host ""

$base = "frontend\src\app\dashboard"
$files = Get-ChildItem -Path $base -Recurse -Include "page.tsx"
$fixed = 0

foreach ($file in $files) {
  $path = $file.FullName
  $original = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

  # Step 1: Remove DashboardLayout import if still present
  $text = $original -replace "(?m)^.*import DashboardLayout.*$\r?\n", ""

  # Step 2: Remove <DashboardLayout> opening tag lines
  $text = $text -replace "(?m)^\s*<DashboardLayout[^>]*>\s*$\r?\n?", ""

  # Step 3: Remove </DashboardLayout> closing tag lines
  $text = $text -replace "(?m)^\s*</DashboardLayout>\s*$\r?\n?", ""

  # Step 4: Find return ( and check if it's followed by a fragment
  # Pattern: return ( then whitespace/newlines then something that is NOT <>
  # We need to add <> after return ( and </> before the closing )
  
  # Only fix if return ( exists and is NOT already wrapped with <>
  if ($text -match "return \([\s\r\n]+<>" ) {
    # Already has fragment wrapper - skip
    if ($text -ne $original) {
      [System.IO.File]::WriteAllText($path, $text, [System.Text.Encoding]::UTF8)
      Write-Host "  Cleaned (already fragmented): $($file.Directory.Name)" -ForegroundColor DarkGray
      $fixed++
    }
    continue
  }

  if ($text -match "return \(") {
    # Add fragment wrapper
    # Replace: return (\n...content...\n  );\n}
    # With:    return (\n    <>\n...content...\n    </>\n  );\n}

    # Find the return ( line and inject <> after it
    $lines = $text -split "`n"
    $newLines = [System.Collections.Generic.List[string]]::new()
    $returnIdx = -1
    $lastCloseIdx = -1

    # Find return ( line
    for ($i = 0; $i -lt $lines.Count; $i++) {
      if ($lines[$i] -match "^\s*return \(\s*$") {
        $returnIdx = $i
        break
      }
    }

    # Find last ); or ) that closes return - scan from end
    for ($i = $lines.Count - 1; $i -ge 0; $i--) {
      if ($lines[$i] -match "^\s*\);\s*$" -or ($lines[$i] -match "^\s*\)\s*$" -and $i -gt $returnIdx)) {
        $lastCloseIdx = $i
        break
      }
    }

    if ($returnIdx -ge 0 -and $lastCloseIdx -gt $returnIdx) {
      $indent = "  "
      for ($i = 0; $i -lt $lines.Count; $i++) {
        $newLines.Add($lines[$i])
        if ($i -eq $returnIdx) {
          $newLines.Add("$indent  <>")
        }
        if ($i -eq ($lastCloseIdx - 1)) {
          $newLines.Add("$indent  </>")
        }
      }
      $text = $newLines -join "`n"
      Write-Host "  Wrapped: $($file.Directory.Name)" -ForegroundColor Green
      $fixed++
    }
  }

  if ($text -ne $original) {
    [System.IO.File]::WriteAllText($path, $text, [System.Text.Encoding]::UTF8)
  }
}

Write-Host ""
Write-Host "$fixed files processed." -ForegroundColor Green
Write-Host ""

# Verify no remaining issues
Write-Host "Verifying files..." -ForegroundColor Yellow
$errors = 0
foreach ($file in $files) {
  $content = [System.IO.File]::ReadAllText($file.FullName)
  if ($content -match "import DashboardLayout") {
    Write-Host "  WARNING - still has import: $($file.Directory.Name)" -ForegroundColor Red
    $errors++
  }
  if ($content -match "<DashboardLayout") {
    Write-Host "  WARNING - still has tag: $($file.Directory.Name)" -ForegroundColor Red
    $errors++
  }
}

if ($errors -eq 0) {
  Write-Host "All files clean!" -ForegroundColor Green
} else {
  Write-Host "$errors issues remaining." -ForegroundColor Red
}

Write-Host ""

# Push
$gitStatus = git status --short 2>&1
if ($gitStatus) {
  Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
  git add .
  git commit -m "fix: definitive fragment wrapper fix for all dashboard pages"
  git push origin main
  Write-Host ""
  Write-Host "Pushed! Vercel is building now." -ForegroundColor Cyan
  Write-Host "Check: https://vercel.com/lamidecoders-projects" -ForegroundColor White
} else {
  Write-Host "No changes to push." -ForegroundColor Gray
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Magenta
