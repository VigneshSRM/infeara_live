Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"
$root = "D:\Automation\Infeara Website"
$outDir = Join-Path $root "public\brand"
$appDir = Join-Path $root "app"

$src = [System.Drawing.Bitmap]::FromFile((Join-Path $outDir "infeara-logo.png"))
$w = $src.Width; $h = $src.Height
$rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
$data = $src.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $data.Stride
$bytes = New-Object byte[] ($stride * $h)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
$src.UnlockBits($data)

# coral pixels = R > B ; find the rightmost coral cluster
$xMin = $w; $xMax = -1; $cy = 0; $cyCount = 0
for ($y = 0; $y -lt $h; $y++) {
  $row = $y * $stride
  for ($x = 0; $x -lt $w; $x++) {
    $i = $row + ($x * 4)
    if ($bytes[$i + 3] -lt 64) { continue }
    if ($bytes[$i + 2] -gt $bytes[$i]) {
      if ($x -gt ($w * 0.68)) {
        if ($x -lt $xMin) { $xMin = $x }
        if ($x -gt $xMax) { $xMax = $x }
        $cy += $y; $cyCount++
      }
    }
  }
}
if ($xMax -lt 0) { throw "no coral cluster found" }
$coralCx = [int][math]::Round(($xMin + $xMax) / 2)
$coralCy = [int][math]::Round($cy / $cyCount)
"right coral cluster: x=$xMin..$xMax center=$coralCx y-center=$coralCy pixels=$cyCount"

# letter height from the global alpha bbox
$minY = $h; $maxY = -1
for ($y = 0; $y -lt $h; $y++) {
  for ($x = 0; $x -lt $w; $x += 2) {
    if ($bytes[($y * $stride) + ($x * 4) + 3] -gt 64) { if ($y -lt $minY) { $minY = $y }; if ($y -gt $maxY) { $maxY = $y }; break }
  }
}
$letterH = $maxY - $minY + 1
$side = $letterH
$x0 = $coralCx - [int][math]::Floor($side / 2)
$y0 = $minY
"letter height=$letterH  crop x0=$x0 y0=$y0 side=$side"

function Save-Icon([System.Drawing.Bitmap]$bmp, [int]$cx0, [int]$cy0, [int]$cw, [int]$ch, [double]$padPct, [int]$size, [string]$path) {
  $canvas = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $g.Clear([System.Drawing.Color]::Transparent)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $box = [int][math]::Round($size * (1 - ($padPct * 2)))
  $dw = $box; $dh = $box
  $dx = [int][math]::Round(($size - $dw) / 2); $dy = [int][math]::Round(($size - $dh) / 2)
  $srcRect = New-Object System.Drawing.Rectangle $cx0, $cy0, $cw, $ch
  $dstRect = New-Object System.Drawing.Rectangle $dx, $dy, $dw, $dh
  $g.DrawImage($bmp, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  $canvas.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Dispose()
}

Save-Icon $src $x0 $y0 $side $side 0.14 512 (Join-Path $outDir "infeara-icon-512.png")
Save-Icon $src $x0 $y0 $side $side 0.14 192 (Join-Path $outDir "infeara-icon-192.png")
Save-Icon $src $x0 $y0 $side $side 0.14 512 (Join-Path $appDir "icon.png")
Save-Icon $src $x0 $y0 $side $side 0.22 180 (Join-Path $appDir "apple-icon.png")
$src.Dispose()
"icons written"
