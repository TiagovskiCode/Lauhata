param([string]$In,[string]$Out,[int]$Y,[int]$H,[int]$W=0)
Add-Type -AssemblyName System.Drawing
$img=[System.Drawing.Image]::FromFile($In)
if($W -le 0){$W=$img.Width}
if($Y+$H -gt $img.Height){$H=$img.Height-$Y}
$bmp=New-Object System.Drawing.Bitmap([int]$W,[int]$H)
$g=[System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img,(New-Object System.Drawing.Rectangle(0,0,[int]$W,[int]$H)),(New-Object System.Drawing.Rectangle(0,[int]$Y,[int]$W,[int]$H)),[System.Drawing.GraphicsUnit]::Pixel)
$bmp.Save($Out,[System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose();$bmp.Dispose();$img.Dispose()
