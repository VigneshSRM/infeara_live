Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"
$root = "D:\Automation\Infeara Website"

$src = [System.Drawing.Bitmap]::FromFile((Join-Path $root "Logo.png"))
$w = $src.Width; $h = $src.Height
$rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
$data = $src.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $data.Stride
$bytes = New-Object byte[] ($stride * $h)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
$src.UnlockBits($data)
$src.Dispose()

$threshold = 64
$colCount = New-Object int[] $w
for ($x = 0; $x -lt $w; $x++) {
  $n = 0
  for ($y = 0; $y -lt $h; $y++) {
    if ($bytes[($y * $stride) + ($x * 4) + 3] -ge $threshold) { $n++ }
  }
  $colCount[$x] = $n
}

$runs = @(); $start = -1
for ($x = 0; $x -lt $w; $x++) {
  if ($colCount[$x] -gt 0 -and $start -lt 0) { $start = $x }
  elseif ($colCount[$x] -eq 0 -and $start -ge 0) { $runs += ,@($start, ($x - 1)); $start = -1 }
}
if ($start -ge 0) { $runs += ,@($start, ($w - 1)) }
"runs ($($runs.Count)): " + (($runs | ForEach-Object { "$($_[0])-$($_[1])(w=$($_[1]-$_[0]+1))" }) -join "  ")
