#!/usr/bin/env bash
# 风火GEO 一键部署脚本（腾讯云 Lighthouse · 东京 2C2G · Ubuntu/Debian）
# 用法: sudo bash deploy-server.sh
# 由风火GEO生成 · 学习演示
set -euo pipefail

BASE=/opt/fenghuo-geo
BRANCH=main
REPO_URL=https://github.com/GGpoint3333/fenghuo-geo.git

log(){ echo "[deploy] $*"; }

# ---------- 0. 系统依赖 ----------
if ! command -v apt-get >/dev/null 2>&1; then
  log "错误: 未检测到 apt-get，本脚本面向 Ubuntu/Debian。系统信息如下:"
  cat /etc/os-release || true
  exit 1
fi
if ! command -v nginx >/dev/null 2>&1; then
  log "安装 nginx ..."
  apt-get update -y
  apt-get install -y nginx
fi
NODE_MAJOR=0
if command -v node >/dev/null 2>&1; then
  NODE_MAJOR=$(node -v | sed 's/^v//' | cut -d. -f1)
fi
if [ "$NODE_MAJOR" -lt 20 ]; then
  log "安装 Node.js 22.x ..."
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
log "node 版本: $(node -v)  npm 版本: $(npm -v)"

# ---------- 0.5 swap（2G 内存构建保险） ----------
if [ -z "$(swapon --show)" ]; then
  log "未检测到 swap，创建 2G swapfile ..."
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# ---------- 1. 拉取代码 ----------
log "同步代码到 $BASE ..."
if [ -d "$BASE/.git" ]; then
  git -C "$BASE" fetch --depth 1 origin "$BRANCH"
  git -C "$BASE" reset --hard "origin/$BRANCH"
else
  rm -rf "$BASE"
  git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$BASE"
fi

# ---------- 2. 安装依赖 ----------
cd "$BASE"
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
if ! command -v pnpm >/dev/null 2>&1; then
  if command -v corepack >/dev/null 2>&1; then
    corepack enable
    corepack prepare pnpm@10.17.1 --activate
  else
    npm install -g pnpm@10
  fi
fi
log "pnpm 版本: $(pnpm -v)"
pnpm install --frozen-lockfile || pnpm install

# ---------- 3. 构建 ----------
log "构建官网 (next build，约 2-4 分钟) ..."
NODE_OPTIONS=--max-old-space-size=2048 pnpm build
log "构建产物 BUILD_ID: $(cat site/.next/BUILD_ID)"

# ---------- 4. systemd 服务 ----------
log "写入 systemd 服务 ..."
NODE_BIN=$(command -v node)
cat > /etc/systemd/system/fenghuo.service <<'UNITEOF'
[Unit]
Description=Fenghuo GEO website (Next.js)
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/fenghuo-geo/site
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=127.0.0.1
ExecStart=NODE_BIN_PLACEHOLDER node_modules/next/dist/bin/next start -p 3000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
UNITEOF
sed -i "s|NODE_BIN_PLACEHOLDER|$NODE_BIN|g" /etc/systemd/system/fenghuo.service
systemctl daemon-reload
systemctl enable fenghuo.service
systemctl restart fenghuo.service

# ---------- 5. nginx 反代 ----------
log "写入 nginx 配置 ..."
cat > /etc/nginx/sites-available/fenghuo <<'NGINXEOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name fhgeo.u3sa.com _;

    client_max_body_size 10m;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript application/xml image/svg+xml;

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
NGINXEOF
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/fenghuo /etc/nginx/sites-enabled/fenghuo
nginx -t
systemctl reload nginx || systemctl restart nginx

# ---------- 6. 健康检查 ----------
log "等待 Next.js 启动 ..."
OK=0
for i in $(seq 1 30); do
  sleep 2
  if curl -fsS -o /dev/null http://127.0.0.1:3000/; then
    OK=1
    log "本机 3000 端口就绪"
    break
  fi
done
if [ "$OK" -eq 0 ]; then
  log "警告: 3000 端口未就绪，查看日志: journalctl -u fenghuo -n 50"
  systemctl status fenghuo --no-pager -l || true
  exit 1
fi
curl -fsS -o /dev/null -w "nginx 80 端口: HTTP %{http_code}\n" -H "Host: fhgeo.u3sa.com" http://127.0.0.1/ || true
log "部署完成!"
log "公网地址: http://43.167.188.45  |  域名: http://fhgeo.u3sa.com"