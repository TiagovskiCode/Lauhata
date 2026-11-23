# Web versions of the selected Lauhata photographs from media-source/ (DJI originals of 15 Nov 2026, 4000x2250).
# The originals are read only, never changed. Output: src/assets/img/fotos/<slug>-640.jpg, -1080.jpg, -1600.jpg (JPEG q80).
# Run from website/:  powershell -ExecutionPolicy Bypass -File tools/otimizar-drone-2026-11.ps1
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$srcDir = Join-Path $root "media-source"
$outDir = Join-Path $root "src/assets/img/fotos"
$map = [ordered]@{
  "DJI_0828" = "costa-montanhas";        # the beach and the mountains behind, from the sea
  "DJI_0829" = "vista-de-cima";          # straight down: garden, rooms, beach and sea
  "DJI_0833" = "quarto-entrada";         # a room's door and the bench on its veranda
  "DJI_0839" = "quartos-varanda";        # the rooms' veranda with chairs and a table
  "DJI_0832" = "quartos-corredor";       # the veranda walkway and the garden
  "DJI_0836" = "quartos-jardim";         # the rooms' building behind the palms, from the garden
  "DJI_0838" = "jardim-varanda";         # a table in the garden beside the veranda
}
$widths = 640, 1080, 1600
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]80)
foreach ($name in $map.Keys) {
  $img = [System.Drawing.Image]::FromFile((Join-Path $srcDir "$name.JPG"))
  foreach ($w in $widths) {
    $h = [int][math]::Round($img.Height * $w / $img.Width)
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = "HighQualityBicubic"; $g.SmoothingMode = "HighQuality"; $g.PixelOffsetMode = "HighQuality"
    $g.DrawImage($img, 0, 0, $w, $h)
    $file = Join-Path $outDir ("{0}-{1}.jpg" -f $map[$name], $w)
    $bmp.Save($file, $codec, $params)
    $g.Dispose(); $bmp.Dispose()
    "{0} -> {1} ({2:N0} KB)" -f $name, (Split-Path $file -Leaf), ((Get-Item $file).Length / 1KB)
  }
  $img.Dispose()
}
