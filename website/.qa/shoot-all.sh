T="C:/Users/tiago/.claude/plugins/cache/taste-skill/taste-skill/2.5.1/skills/taste-skill/scripts"
export CHROME_PATH="C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe"
cd /c/Users/tiago/Desktop/Lauhata/website
for w in 1440 1024 768 375; do
  for r in "/:home" "/restaurant/:restaurant" "/stay/:stay" "/stay/queen-room/:room" "/events/:events" "/gallery/:gallery" "/about/:about" "/contact/:contact" "/discover-liquica/:discover"; do
    p="${r%%:*}"; n="${r##*:}"
    node "$T/shoot.mjs" --url "http://localhost:8080$p" --w $w --out ".qa/shots/$n-$w.png" --profile .taste-skill/chrome-shoot --no-tiles >> .qa/shoot-log.txt 2>&1
  done
done
echo ALLDONE >> .qa/shoot-log.txt
