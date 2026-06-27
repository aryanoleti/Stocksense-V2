#!/bin/bash

# ============================================================
#  StockSense V2 — Automated GitHub + Vercel Deploy Script
#  Run this ONCE from inside the stocksense folder
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${BLUE}   StockSense V2 — GitHub + Vercel Deploy Script   ${NC}"
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ── Check dependencies ──────────────────────────────────────
echo -e "${YELLOW}[1/6] Checking dependencies...${NC}"

if ! command -v git &>/dev/null; then
  echo -e "${RED}✗ git not found. Install from https://git-scm.com${NC}"; exit 1
fi
if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ node not found. Install from https://nodejs.org${NC}"; exit 1
fi
if ! command -v npm &>/dev/null; then
  echo -e "${RED}✗ npm not found. Install from https://nodejs.org${NC}"; exit 1
fi

echo -e "${GREEN}✓ git, node, npm found${NC}"

# ── Check GitHub CLI ────────────────────────────────────────
if ! command -v gh &>/dev/null; then
  echo ""
  echo -e "${YELLOW}GitHub CLI (gh) not found. Installing...${NC}"
  
  OS="$(uname -s)"
  case "$OS" in
    Darwin)
      if command -v brew &>/dev/null; then
        brew install gh
      else
        echo -e "${RED}Install Homebrew first: https://brew.sh${NC}"
        echo -e "${RED}Then run: brew install gh${NC}"
        exit 1
      fi
      ;;
    Linux)
      type -p curl >/dev/null || (sudo apt update && sudo apt install curl -y)
      curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
      echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
      sudo apt update && sudo apt install gh -y
      ;;
    MINGW*|MSYS*|CYGWIN*)
      echo -e "${RED}On Windows, install GitHub CLI from: https://cli.github.com${NC}"
      echo -e "${RED}Then re-run this script.${NC}"
      exit 1
      ;;
  esac
fi

echo -e "${GREEN}✓ GitHub CLI ready${NC}"

# ── GitHub Login ────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[2/6] GitHub authentication...${NC}"

if ! gh auth status &>/dev/null; then
  echo -e "${BLUE}→ Opening GitHub login in browser...${NC}"
  gh auth login --web --git-protocol https
else
  GH_USER=$(gh api user --jq '.login')
  echo -e "${GREEN}✓ Already logged in as: ${BOLD}$GH_USER${NC}"
fi

GH_USER=$(gh api user --jq '.login')

# ── Create .gitignore ───────────────────────────────────────
echo ""
echo -e "${YELLOW}[3/6] Setting up repository files...${NC}"

cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Build output
.next/
out/
dist/
build/

# Environment variables (NEVER commit these)
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Prisma
prisma/*.db
prisma/*.db-journal

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
*.swp
*.swo

# Vercel
.vercel
EOF

echo -e "${GREEN}✓ .gitignore created${NC}"

# ── Git init & commit ────────────────────────────────────────
git init -b main 2>/dev/null || git checkout -b main 2>/dev/null || true
git add .
git commit -m "🚀 StockSense V2 — Full-stack stock market platform

Features:
- Live stock prices via Finnhub API (15s refresh)
- AI prediction chart with SMA, RSI, 7-day forecast
- Groq AI chatbot with streaming responses
- Virtual portfolio simulator (₹5L starting balance)
- Market news with AI sentiment analysis
- NextAuth authentication + Prisma + PostgreSQL
- Next.js 15 App Router + TypeScript + TailwindCSS" 2>/dev/null || \
git commit --allow-empty -m "🚀 StockSense V2 initial commit" 2>/dev/null || true

echo -e "${GREEN}✓ Code committed${NC}"

# ── Create GitHub repo ──────────────────────────────────────
echo ""
echo -e "${YELLOW}[4/6] Creating GitHub repository...${NC}"

REPO_NAME="stocksense-v2"

# Check if repo already exists
if gh repo view "$GH_USER/$REPO_NAME" &>/dev/null; then
  echo -e "${YELLOW}→ Repo already exists, pushing to it...${NC}"
else
  gh repo create "$REPO_NAME" \
    --public \
    --description "🚀 Real-time stock market platform with AI predictions, chatbot, and portfolio simulator" \
    --homepage "https://$REPO_NAME.vercel.app"
  echo -e "${GREEN}✓ GitHub repo created: https://github.com/$GH_USER/$REPO_NAME${NC}"
fi

# ── Push code ───────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[5/6] Pushing code to GitHub...${NC}"

git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$GH_USER/$REPO_NAME.git"
git push -u origin main --force

echo -e "${GREEN}✓ Code pushed to GitHub!${NC}"
echo -e "${BLUE}   → https://github.com/$GH_USER/$REPO_NAME${NC}"

# ── Deploy to Vercel ─────────────────────────────────────────
echo ""
echo -e "${YELLOW}[6/6] Deploying to Vercel...${NC}"

if ! command -v vercel &>/dev/null; then
  echo -e "${BLUE}→ Installing Vercel CLI...${NC}"
  npm install -g vercel
fi

echo ""
echo -e "${BOLD}${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${YELLOW}   IMPORTANT — You need to set env variables now!   ${NC}"
echo -e "${BOLD}${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  The deploy will start. When Vercel asks questions:"
echo -e "  ${GREEN}Set up and deploy? → Y${NC}"
echo -e "  ${GREEN}Which scope? → your account${NC}"
echo -e "  ${GREEN}Link to existing project? → N${NC}"
echo -e "  ${GREEN}Project name? → stocksense-v2${NC}"
echo -e "  ${GREEN}Directory? → ./${NC}"
echo ""
echo -e "${BLUE}→ After deploy, go to vercel.com/dashboard to add env variables${NC}"
echo ""
read -p "Press ENTER to start Vercel deploy..."

vercel --yes 2>/dev/null || vercel

echo ""
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}   ✓ All done! Here's what was created:             ${NC}"
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${BOLD}GitHub:${NC}  https://github.com/$GH_USER/$REPO_NAME"
echo -e "  ${BOLD}Vercel:${NC}  https://$REPO_NAME.vercel.app"
echo ""
echo -e "${YELLOW}  ⚠  FINAL STEP — Add these env vars in Vercel dashboard:${NC}"
echo -e "     vercel.com → stocksense-v2 → Settings → Environment Variables"
echo ""
echo -e "     DATABASE_URL"
echo -e "     NEXTAUTH_SECRET"
echo -e "     NEXTAUTH_URL        (set to your .vercel.app URL)"
echo -e "     FINNHUB_API_KEY"
echo -e "     GROQ_API_KEY"
echo -e "     NEWS_API_KEY"
echo ""
echo -e "  Then go to Deployments → click ⋯ → Redeploy"
echo ""
