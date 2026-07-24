import re
import os

def clean_component(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern: {language === "pt" ? "Text A" : "Text B"} -> {"Text A"}
    content = re.sub(r'\{language\s*===\s*"pt"\s*\?\s*([^?:]+)\s*:\s*[^?:]+\}', r'{\1}', content)
    
    # Pattern: language === "pt" ? "Text A" : "Text B" -> "Text A"
    content = re.sub(r'language\s*===\s*"pt"\s*\?\s*([^?:]+)\s*:\s*[^?:]+', r'\1', content)

    # Specific fields: cardiModule.categoryEn -> cardiModule.category
    content = content.replace('.categoryEn', '.category')
    content = content.replace('.titleEn', '.title')
    content = content.replace('.descriptionEn', '.description')
    content = content.replace('.contentEn', '.content')
    content = content.replace('.questionEn', '.question')
    content = content.replace('.optionsEn', '.options')
    content = content.replace('.explanationEn', '.explanation')
    content = content.replace('.examSourceEn', '.examSource')
    content = content.replace('.examNameEn', '.examName')
    content = content.replace('labelEn', 'label')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

components = [
    'src/components/Dashboard.tsx',
    'src/components/ExamPrep.tsx',
    'src/components/StudyModules.tsx',
    'src/App.tsx',
    'src/components/Sidebar.tsx',
    'src/components/Login.tsx',
    'src/components/ProfileSettings.tsx'
]

for comp in components:
    if os.path.exists(comp):
        clean_component(comp)
