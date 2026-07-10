import re

with open('c:/Users/manas/OneDrive/Documents/Desktop/H D I/HDI-prediction-system/static/css/style.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove stray ``` that appear on their own line (not in comments)
lines = content.split('\n')
fixed_lines = []
for line in lines:
    # Skip lines that contain only ```
    if line.strip() == '```':
        continue
    fixed_lines.append(line)

content = '\n'.join(fixed_lines)

with open('c:/Users/manas/OneDrive/Documents/Desktop/H D I/HDI-prediction-system/static/css/style.css', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')