# Makes the web sizes of the TEMPORARY dish and drink photos fetched by tools/fotos-temporarias.mjs:
# originais/fotos/pratos-temporarios/<id>.jpg  ->  src/assets/img/pratos-temp/<id>-640.jpg and <id>-1080.jpg (4:3, centre crop).
# Windows only (System.Drawing); run from website/:
#   powershell -ExecutionPolicy Bypass -File tools/otimizar-temporarias.ps1
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$srcDir = Join-Path $root "originais/fotos/pratos-temporarios"
$outDir = Join-Path $root "src/assets/img/pratos-temp"
New-Item -ItemType Directory -Force $outDir | Out-Null
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]80)
$n = 0
foreach ($file in Get-ChildItem $srcDir -Filter *.jpg) {
  $img = [System.Drawing.Image]::FromFile($file.FullName)
  # Centre crop to 4:3.
  $w = $img.Width; $h = $img.Height
  if ($w / $h -gt 4 / 3) { $cw = [int]($h * 4 / 3); $ch = $h } else { $cw = $w; $ch = [int]($w * 3 / 4) }
  $crop = New-Object System.Drawing.Rectangle ([int](($w - $cw) / 2)), ([int](($h - $ch) / 2)), $cw, $ch
  foreach ($tw in 640, 1080) {
    if ($tw -gt $cw -and $tw -ne 640) { continue }
    $th = [int]($tw * 3 / 4)
    $bmp = New-Object System.Drawing.Bitmap $tw, $th
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, 0, $tw, $th), $crop.X, $crop.Y, $crop.Width, $crop.Height, [System.Drawing.GraphicsUnit]::Pixel)
    $bmp.Save((Join-Path $outDir "$($file.BaseName)-$tw.jpg"), $codec, $params)
    $g.Dispose(); $bmp.Dispose()
  }
  $img.Dispose(); $n++
}
"$n photos sized into src/assets/img/pratos-temp/"
