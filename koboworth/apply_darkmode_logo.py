import os

directories = [
    '/home/truphile/Documents/capstone/koboworth/frontend/src',
    '/home/truphile/Documents/capstone/koboworth/frontend-collector/src',
    '/home/truphile/Documents/capstone/koboworth/frontend-lender/src'
]

for d in directories:
    for root, dirs, files in os.walk(d):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                
                # We need to find lines with src="/logo.png"
                lines = content.split('\n')
                modified = False
                for i, line in enumerate(lines):
                    if 'src="/logo.png"' in line and 'brightness-0' not in line:
                        if 'className="' in line:
                            lines[i] = line.replace('className="', 'className="dark:invert ')
                            modified = True
                            
                if modified:
                    with open(filepath, 'w') as f:
                        f.write('\n'.join(lines))
                    print(f"Updated {filepath}")

