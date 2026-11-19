param([string]$In,[string]$Out,[int]$ColW=330,[int]$ColH=1500)
Add-Type -AssemblyName System.Drawing
$img=[System.Drawing.Image]::FromFile($In)
$scale=$ColW/$img.Width
$th=[int]($img.Height*$scale)
$cols=[math]::Ceiling($th/$ColH)
$bmp=New-Object System.Drawing.Bitmap(($cols*($ColW+10)),[math]::Min($ColH,$th))
$g=[System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::White)
$g.InterpolationMode='HighQualityBicubic'
for($c=0;$c -lt $cols;$c++){
  $srcY=[int]($c*$ColH/$scale); $srcH=[int]($ColH/$scale)
  if($srcY+$srcH -gt $img.Height){$srcH=$img.Height-$srcY}
  $dest=New-Object System.Drawing.Rectangle(($c*($ColW+10)),0,$ColW,[int]($srcH*$scale))
  $src=New-Object System.Drawing.Rectangle(0,$srcY,$img.Width,$srcH)
  $g.DrawImage($img,$dest,$src,[System.Drawing.GraphicsUnit]::Pixel)
}
$bmp.Save($Out,[System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose();$bmp.Dispose();$img.Dispose()
