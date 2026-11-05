Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$root = "D:\Automation\Infeara Website"
$srcPath = Join-Path $root "Logo.png"
$outDir = Join-Path $root "public\brand"
$appDir = Join-Path $root "app"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
New-Item -ItemType Directory -Force -Path $appDir | Out-Null

$BLUE  = @(0x22, 0x61, 0x92)
$CORAL = @(0xEF, 0x85, 0x57)
$IVORY = @(0xEA, 0xE6, 0xDE)

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$w = $src.Width; $h = $src.Height
$rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
$data = $src.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $data.Stride
$bytes = New-Object byte[] ($stride * $h)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
$src.UnlockBits($data)
$src.Dispose()

# one pass: alpha bounding box + recolour into two buffers (BGRA order)
$full = New-Object byte[] ($stride * $h)
$light = New-Object byte[] ($stride * $h)
$minX = $w; $minY = $h; $maxX = -1; $maxY = -1
$blueCount = 0; $coralCount = 0

for ($y = 0; $y -lt $h; $y++) {
  $row = $y * $stride
  for ($x = 0; $x -lt $w; $x++) {
    $i = $row + ($x * 4)
    $b = $bytes[$i]; $g = $bytes[$i + 1]; $r = $bytes[$i + 2]; $a = $bytes[$i + 3]
    if ($a -eq 0) { continue }
    if ($a -gt 8) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
    if ($b -gt $r) {
      $full[$i] = $BLUE[2]; $full[$i+1] = $BLUE[1]; $full[$i+2] = $BLUE[0]; $full[$i+3] = $a
      $light[$i] = $IVORY[2]; $light[$i+1] = $IVORY[1]; $light[$i+2] = $IVORY[0]; $light[$i+3] = $a
      $blueCount++
    } else {
      $full[$i] = $CORAL[2]; $full[$i+1] = $CORAL[1]; $full[$i+2] = $CORAL[0]; $full[$i+3] = $a
      $light[$i] = $CORAL[2]; $light[$i+1] = $CORAL[1]; $light[$i+2] = $CORAL[0]; $light[$i+3] = $a
      $coralCount++
    }
  }
}

function Save-Map($map, $width, $height, $stride, $path, $targetW) {
  $bmp = New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $dst = $bmp.LockBits((New-Object System.Drawing.Rectangle 0,0,$width,$height), [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  [System.Runtime.InteropServices.Marshal]::Copy($map, 0, $dst.Scan0, $map.Length)
  $bmp.UnlockBits($dst)
  $targetH = [int][math]::Round($height * ($targetW / $width))
  $scaled = New-Object System.Drawing.Bitmap $targetW, $targetH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [System.Drawing.Graphics]::FromImage($scaled)
  $gfx.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $gfx.DrawImage($bmp, 0, 0, $targetW, $targetH)
  $gfx.Dispose()
  $scaled.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $scaled.Dispose()
  $bmp.Dispose()
}

Save-Map $full  $w $h $stride (Join-Path $outDir "infeara-logo.png") 1200
Save-Map $light $w $h $stride (Join-Path $outDir "infeara-logo-light.png") 1200

# square icon from the final glyph ("A" with the coral triangle)
$bboxW = $maxX - $minX + 1
$bboxH = $maxY - $minY + 1
$side = $bboxH
$x0 = $maxX - $side + 1
$y0 = $minY

function Save-Icon($map, $stride, $x0, $y0, $side, $padPct, $size, $path) {
  $crop = New-Object System.Drawing.Bitmap $side, $side, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $cd = $crop.LockBits((New-Object System.Drawing.Rectangle 0,0,$side,$side), [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $cropBytes = New-Object byte[] ($cd.Stride * $side)
  for ($y = 0; $y -lt $side; $y++) {
    $srcRow = (($y0 + $y) * $stride) + ($x0 * 4)
    $dstRow = $y * $cd.Stride
    [Array]::Copy($map, $srcRow, $cropBytes, $dstRow, ($side * 4))
  }
  [System.Runtime.InteropServices.Marshal]::Copy($cropBytes, 0, $cd.Scan0, $cropBytes.Length)
  $crop.UnlockBits($cd)

  $canvas = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gfx = [System.Drawing.Graphics]::FromImage($canvas)
  $gfx.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $gfx.Clear([System.Drawing.Color]::Transparent)
  $inner = [int][math]::Round($size * (1 - ($padPct * 2)))
  $off = [int][math]::Round(($size - $inner) / 2)
  $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gfx.DrawImage($crop, $off, $off, $inner, $inner)
  $gfx.Dispose()
  $canvas.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Dispose(); $crop.Dispose()
}

Save-Icon $full $stride $x0 $y0 $side 0.10 512 (Join-Path $outDir "infeara-icon-512.png")
Save-Icon $full $stride $x0 $y0 $side 0.10 192 (Join-Path $outDir "infeara-icon-192.png")
Save-Icon $full $stride $x0 $y0 $side 0.10 512 (Join-Path $appDir "icon.png")
Save-Icon $full $stride $x0 $y0 $side 0.18 180 (Join-Path $appDir "apple-icon.png")

"source ${w}x${h}"
"alpha bbox  x=$minX..$maxX y=$minY..$maxY  (${bboxW}x${bboxH})"
"blue px=$blueCount  coral px=$coralCount"
"icon crop x0=$x0 y0=$y0 side=$side"
