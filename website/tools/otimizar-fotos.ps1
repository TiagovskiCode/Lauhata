# Converts the original photos in originais/fotos/maqueta/ into web-sized JPEGs under
# src/assets/img/fotos/ (<slug>-640.jpg, -1080.jpg, -1600.jpg) and writes the
# 1200x630 social image. Windows only (System.Drawing); run from website/:
#   powershell -ExecutionPolicy Bypass -File tools/otimizar-fotos.ps1
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$srcDir = Join-Path $root "originais/fotos/maqueta"
$outDir = Join-Path $root "src/assets/img/fotos"
New-Item -ItemType Directory -Force $outDir | Out-Null

# Dish photos (grilled fish, squid, curry, batar da'an, tukir, banana cake, coffee, coconut water…) are not here on
# purpose: they showed dishes that are not on Lauhata's real menu. The originals stay in originais/fotos/maqueta/.
# Original file name (start) -> slug, plus an optional crop from the top (px) to drop the
# cream arch background of "A nossa história".
$map = @(
  @{ match = "Hero*";                   slug = "hero-por-do-sol" },
  @{ match = "Imagem de partilha*";     slug = "costa-por-do-sol" },
  @{ match = "Cart*Restaurante*";       slug = "mesa-restaurante" },
  @{ match = "Cart*Alojamento*";        slug = "terraco-mar" },
  @{ match = "Quartos*";                slug = "quarto-jardim" },
  @{ match = "Suite*";                  slug = "suite-familia" },
  @{ match = "A nossa*";                slug = "tais"; cropTop = 320 },
)
$widths = 640, 1080, 1600

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]80)

function Save-Resized($img, [System.Drawing.Rectangle]$crop, [int]$w, [int]$h, [string]$path) {
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $attr = New-Object System.Drawing.Imaging.ImageAttributes
  $attr.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, 0, $w, $h), $crop.X, $crop.Y, $crop.Width, $crop.Height, [System.Drawing.GraphicsUnit]::Pixel, $attr)
  $bmp.Save($path, $codec, $params)
  $g.Dispose(); $bmp.Dispose()
}

$files = Get-ChildItem $srcDir -Filter *.png
$report = @()
foreach ($m in $map) {
  $file = $files | Where-Object { $_.Name -like $m.match } | Select-Object -First 1
  if (-not $file) { Write-Warning "Missing: $($m.match)"; continue }
  $img = [System.Drawing.Image]::FromFile($file.FullName)
  $top = if ($m.cropTop) { $m.cropTop } else { 0 }
  $crop = New-Object System.Drawing.Rectangle 0, $top, $img.Width, ($img.Height - $top)
  foreach ($w in $widths) {
    $tw = [Math]::Min($w, $crop.Width)
    $th = [int][Math]::Round($crop.Height * $tw / $crop.Width)
    Save-Resized $img $crop $tw $th (Join-Path $outDir "$($m.slug)-$w.jpg")
  }
  $report += "{0,-24} {1}x{2}" -f $m.slug, $crop.Width, $crop.Height

  if ($m.slug -eq "costa-por-do-sol") {
    # 1200x630 social image (1.905:1), centred crop.
    $ch = [int]($img.Width / 1.905)
    $cy = [int](($img.Height - $ch) / 2)
    Save-Resized $img (New-Object System.Drawing.Rectangle 0, $cy, $img.Width, $ch) 1200 630 (Join-Path $root "src/assets/img/og-image.jpg")
  }
  $img.Dispose()
}
$report
