#!/bin/bash

# Script per inizializzare Git e fare push su GitHub
# Esegui questo script dalla cartella "Battaglia navale"

echo "🚀 Setup Git e Push su GitHub"
echo "================================"
echo ""

# Verifica se siamo nella directory corretta
if [ ! -f "frontend/index.html" ]; then
    echo "❌ Errore: Esegui questo script dalla cartella 'Battaglia navale'"
    exit 1
fi

# Inizializza git se non esiste
if [ ! -d ".git" ]; then
    echo "📦 Inizializzazione repository Git..."
    git init
    echo "✓ Repository inizializzato"
else
    echo "✓ Repository Git già esistente"
fi

# Aggiungi .gitignore se non esiste
if [ ! -f ".gitignore" ]; then
    echo "📝 Creazione .gitignore..."
    cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Temporary
*.tmp
*.bak
EOF
    echo "✓ .gitignore creato"
fi

# Mostra lo stato
echo ""
echo "📊 Stato attuale:"
git status

# Aggiungi tutti i file
echo ""
echo "➕ Aggiunta file modificati..."
git add frontend/js/app.js
git add frontend/js/peerjs.min.js
git add frontend/index.html
git add *.md
git add .gitignore

# Mostra i file aggiunti
echo ""
echo "📝 File da committare:"
git status --short

# Chiedi conferma
echo ""
read -p "Vuoi procedere con il commit? (s/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    # Commit
    echo "💾 Commit in corso..."
    git commit -m "Fix: Complete multiplayer flow with setup screen for both host and guest

- Added PeerJS locally to avoid CDN issues
- Fixed setup screen not appearing after creating live game
- Fixed setup screen not appearing for guest joining with code
- Added room code validation
- Updated all documentation"
    
    echo "✓ Commit completato"
    
    # Verifica se esiste un remote
    if git remote | grep -q "origin"; then
        echo ""
        echo "🌐 Remote 'origin' trovato:"
        git remote -v
        
        echo ""
        read -p "Vuoi fare push su GitHub? (s/n) " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            echo "📤 Push in corso..."
            
            # Determina il branch corrente
            BRANCH=$(git branch --show-current)
            if [ -z "$BRANCH" ]; then
                BRANCH="main"
                git branch -M main
            fi
            
            echo "Branch: $BRANCH"
            git push -u origin $BRANCH
            
            echo ""
            echo "✅ Push completato!"
            echo ""
            echo "⏱️  Aspetta 2-3 minuti per il deploy su GitHub Pages"
            echo "🔄 Poi fai hard refresh: Ctrl+Shift+R (o Cmd+Shift+R)"
            echo "🌐 URL: https://showmehow2play.github.io/Battaglia-Navale/frontend/"
        fi
    else
        echo ""
        echo "⚠️  Nessun remote configurato!"
        echo ""
        echo "Per aggiungere il remote GitHub:"
        echo "git remote add origin https://github.com/showmehow2play/Battaglia-Navale.git"
        echo ""
        echo "Poi esegui di nuovo questo script."
    fi
else
    echo "❌ Commit annullato"
fi

echo ""
echo "✅ Script completato"

# Made with Bob
