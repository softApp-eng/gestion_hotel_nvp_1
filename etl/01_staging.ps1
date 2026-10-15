# ============================================================
# ETL etape 1 : staging des fichiers CSV dans le schema "imp"
# - normalise chaque fichier en CSV a largeur FIXE (parseur CSV .NET :
#   gere guillemets, virgules entre guillemets, champs multiligne vide en fin de ligne)
# - cree imp.<nom> (c01..cNN all-text)  / \copy UTF8 / verifie les comptages
# ============================================================
$ErrorActionPreference = 'Stop'
function Invoke-Psql {
  param([string]$Script)
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  $out = & $psql -q -h localhost -U postgres -d cmo_db2 -v ON_ERROR_STOP=1 -f $Script 2>&1
  $ErrorActionPreference = $prev
  return ,$out
}
$psql = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
$env:PGPASSWORD = "123456789"
$src = "D:\1"
$etl = "F:\github\04-hotel\insp_app\cmo-hotel\etl"
$norm = Join-Path $etl "norm"
New-Item -ItemType Directory -Force -Path $norm | Out-Null

function Csv-Field {
  param([string]$s)
  if ($s -match '[,"\r\n]') {
    return '"' + ($s -replace '"', '""') + '"'
  }
  return $s
}

Add-Type -AssemblyName Microsoft.VisualBasic

$files = Get-ChildItem -LiteralPath $src -File | Where-Object { $_.Length -gt 0 } | Sort-Object Name

# ---- Phase A : comptage naive + largeur max par fichier + NORMALISATION ----
"=== PHASE A : fichiers sources + normalisation ==="
$meta = @{}
foreach ($f in $files) {
  $max = 0
  $reader = New-Object System.IO.StreamReader($f.FullName, [System.Text.Encoding]::UTF8)
  try {
    $parser = New-Object Microsoft.VisualBasic.FileIO.TextFieldParser($reader)
    $parser.TextFieldType = [Microsoft.VisualBasic.FileIO.FieldType]::Delimited
    $parser.SetDelimiters(',')
    $parser.HasFieldsEnclosedInQuotes = $true
    $parser.TrimWhiteSpace = $false
    $records = New-Object System.Collections.Generic.List[object]
    while (-not $parser.EndOfData) {
      $fields = $parser.ReadFields()
      if ($fields.Count -gt $max) { $max = $fields.Count }
      $records.Add($fields)
    }
  } catch {
    "  !! fichier {0} : erreur parse ({1})" -f $f.Name, $_.Exception.Message
    continue
  } finally {
    $parser.Dispose()
  }

  # normalisation a largeur fixe
  $outPath = Join-Path $norm $f.Name
  $sw = New-Object System.IO.StreamWriter($outPath, $false, (New-Object System.Text.UTF8Encoding($false)))
  try {
    foreach ($rec in $records) {
      $out = New-Object System.Collections.Generic.List[string]
      for ($i = 0; $i -lt $max; $i++) {
        if ($i -lt $rec.Count) { $out.Add((Csv-Field $rec[$i])) } else { $out.Add('') }
      }
      $sw.WriteLine(($out -join ','))
    }
  } finally {
    $sw.Dispose()
  }

  $meta[$f.Name] = @{ Lines = $records.Count; Max = $max }
  $first = if ($records.Count -gt 0) { ($records[0] -join '|') } else { '(vide)' }
  if ($first.Length -gt 100) { $first = $first.Substring(0, 100) + '...' }
  "{0,-24} records={1,-6} largeur_fixe={2,-3} | 1er: {3}" -f $f.Name, $records.Count, $max, $first
}

# ---- Phase B : script psql (schema + \copy depuis fichiers normalises) ----
$psqlScript = @()
$psqlScript += "DROP SCHEMA IF EXISTS imp CASCADE;"
$psqlScript += "CREATE SCHEMA imp;"
$psqlScript += ""
foreach ($f in $files) {
  $t = $f.BaseName
  $cols = (1..$meta[$f.Name].Max) | ForEach-Object { ("c{0:d2} text" -f $_) }
  $psqlScript += "CREATE TABLE imp.$t ($($cols -join ', '));"
  $psqlScript += ("\copy imp.$t from '{0}' with (format csv, null '', encoding 'UTF8');" -f (Join-Path $norm $f.Name))
  $psqlScript += ""
}
$psqlScript += "SELECT '--- tables existantes (public) ---';"
$psqlScript += "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name;"
$psqlScriptFile = Join-Path $etl "staging.sql"
$psqlScript | Set-Content -LiteralPath $psqlScriptFile -Encoding UTF8
"`n=== PHASE B : script psql ecrit dans $psqlScriptFile ==="

# ---- Phase C : execution ----
"`n=== PHASE C : execution psql ==="
$out = Invoke-Psql -Script $psqlScriptFile
$code = $LASTEXITCODE
$out | ForEach-Object { "$_" }
if ($code -ne 0) { "ERREUR psql (code $code)"; exit 1 }

# ---- Phase D : verification comptages staging vs records normalises ----
"`n=== PHASE D : verification comptages ==="
$countScript = @()
$countScript += "SELECT t AS table_staging, count(*) AS lignes FROM ("
$parts = @()
foreach ($f in $files) {
  $t = $f.BaseName
  $parts += "SELECT '$t' AS t, count(*) AS n FROM imp.$t"
}
$countScript += ($parts -join "`nUNION ALL`n")
$countScript += ") x GROUP BY t ORDER BY t;"
$countScriptFile = Join-Path $etl "staging_counts.sql"
$countScript | Set-Content -LiteralPath $countScriptFile -Encoding UTF8
$out2 = Invoke-Psql -Script $countScriptFile
$code2 = $LASTEXITCODE
$out2 | ForEach-Object { "$_" }
if ($code2 -ne 0) { "ERREUR psql comptages (code $code2)"; exit 1 }

"`n=== ATTENDU (records normalises) ==="
foreach ($f in $files) { "{0,-24} = {1}" -f $f.Name, $meta[$f.Name].Lines }