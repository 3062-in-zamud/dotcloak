Output assets/demo.gif

Set FontSize 14
Set Width 900
Set Height 500
Set Theme "Catppuccin Mocha"
Set TypingSpeed 80ms
Set Padding 20

Type "cd /tmp/dotcloak-demo"
Enter
Sleep 500ms

Type "dotcloak init"
Enter
Sleep 1200ms

Type "dotcloak set SECRET_KEY"
Enter
Sleep 500ms
Type "my-super-secret-api-key"
Enter
Sleep 1000ms

Type "dotcloak run -- node -e 'console.log(process.env.SECRET_KEY)'"
Enter
Sleep 1500ms

Type "dotcloak list"
Enter
Sleep 1200ms
