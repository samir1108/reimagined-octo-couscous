Get-ChildItem -Path "D:\final\blank-canvas-banking-3bc6713d\supabase\functions" -Recurse -Filter "*.ts" | ForEach-Object {
  $content = Get-Content $_.FullName -Raw
  $newContent = $content -replace 'https://esm\.sh/@supabase/supabase-js@', 'npm:@supabase/supabase-js@'
  if ($newContent -ne $content) {
    Set-Content $_.FullName $newContent -NoNewline
    Write-Host "Updated: $($_.FullName)"
  }
}
