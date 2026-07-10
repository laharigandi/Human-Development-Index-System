import re

with open('c:/Users/manas/OneDrive/Documents/Desktop/H D I/HDI-prediction-system/static/css/style.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove stray ``` that appear on their own line
content = re.sub(r'\`\`\`\n', '', content)

with open('c:/Users/manas/OneDrive/Documents/Desktop/H D I/HDI-prediction-system/static/css/style.css', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')