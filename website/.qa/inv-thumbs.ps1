# Small previews of the drone photographs in media-source (originals untouched), for the inventory.
Add-Type -AssemblyName System.Drawing
$src = "C:\Users\tiago\Desktop\Lauhata\website\media-source"
$out = "C:\Users\tiago\Desktop\Lauhata\website\.qa\inv"
New-Item -ItemType Directory -Force $out | Out-Null
Get-ChildItem $src -Filter *.JPG | ForEach-Object {
  $img = [System.Drawing.Image]::FromFile($_.FullName)
  $w = 480; $h = [int]($img.Height * $w / $img.Width)
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.DrawImage($img, 0, 0, $w, $h)
  $bmp.Save((Join-Path $out ($_.BaseName + ".jpg")), [System.Drawing.Imaging.ImageFormat]::Jpeg)
  "{0} {1}x{2}" -f $_.Name, $img.Width, $img.Height
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
}
