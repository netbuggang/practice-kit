#!/bin/bash

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 开始配置 Git 多身份环境...${NC}"

# 检查 SSH 目录是否存在
if [ ! -d ~/.ssh ]; then
    echo -e "${YELLOW}创建 SSH 目录...${NC}"
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
fi

# 函数：生成 SSH 密钥
generate_ssh_key() {
    local platform=$1
    local email=$2
    local key_name="id_rsa_${platform}"
    
    echo -e "${YELLOW}为 ${platform} 生成 SSH 密钥...${NC}"
    
    if [ -f ~/.ssh/${key_name} ]; then
        echo -e "${YELLOW}${key_name} 已存在，跳过生成${NC}"
        return 0
    fi
    
    ssh-keygen -t rsa -b 4096 -C "${email}" -f ~/.ssh/${key_name} -N ""
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ ${platform} SSH 密钥生成成功${NC}"
        chmod 600 ~/.ssh/${key_name}
        chmod 644 ~/.ssh/${key_name}.pub
    else
        echo -e "${RED}❌ ${platform} SSH 密钥生成失败${NC}"
        return 1
    fi
}

# 函数：显示公钥
show_public_key() {
    local platform=$1
    local key_name="id_rsa_${platform}"
    
    echo -e "${BLUE}================================${NC}"
    echo -e "${GREEN}${platform} 公钥内容：${NC}"
    echo -e "${BLUE}================================${NC}"
    cat ~/.ssh/${key_name}.pub
    echo -e "${BLUE}================================${NC}"
    echo -e "${YELLOW}请将以上公钥内容复制到 ${platform} 的 SSH Keys 设置中${NC}"
    echo ""
}

# 创建项目目录结构
echo -e "${YELLOW}创建项目目录结构...${NC}"
mkdir -p ~/workspace/{company,opensource,freelance}

# 生成 SSH 密钥
generate_ssh_key "github" "zhangsan@users.noreply.github.com"
generate_ssh_key "gitlab" "zhangsan@company.com" 
generate_ssh_key "coding" "sanzhang@example.com"

# 配置 SSH Config
echo -e "${YELLOW}配置 SSH Config...${NC}"

cat > ~/.ssh/config << 'EOF'
# GitHub - 开源项目
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa_github
    IdentitiesOnly yes

# GitLab - 公司项目  
Host gitlab.com
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_rsa_gitlab
    IdentitiesOnly yes

# Coding - 私活项目
Host e.coding.net
    HostName e.coding.net
    User git
    IdentityFile ~/.ssh/id_rsa_coding
    IdentitiesOnly yes

# 其他通用配置
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 10
    TCPKeepAlive yes
EOF

chmod 600 ~/.ssh/config

# 配置全局 Git 条件包含
echo -e "${YELLOW}配置 Git 全局设置...${NC}"

# 备份原有配置
if [ -f ~/.gitconfig ]; then
    cp ~/.gitconfig ~/.gitconfig.backup.$(date +%Y%m%d%H%M%S)
    echo -e "${YELLOW}已备份原有 ~/.gitconfig${NC}"
fi

# 设置核心配置
cat > ~/.gitconfig << 'EOF'
[core]
    excludesfile = ~/.gitignore_global
[init]
    defaultBranch = main
[pull]
    rebase = false
[push]
    default = simple

# 条件包含配置
[includeIf "gitdir:~/workspace/company/"]
    path = ~/.gitconfig-company
[includeIf "gitdir:~/workspace/opensource/"]
    path = ~/.gitconfig-opensource  
[includeIf "gitdir:~/workspace/freelance/"]
    path = ~/.gitconfig-freelance
EOF

# 创建公司配置
cat > ~/.gitconfig-company << 'EOF'
[user]
    name = 张三
    email = zhangsan@company.com
[core]
    sshCommand = ssh -i ~/.ssh/id_rsa_gitlab
EOF

# 创建开源配置
cat > ~/.gitconfig-opensource << 'EOF'
[user]
    name = Zhang San
    email = zhangsan@users.noreply.github.com
[core]
    sshCommand = ssh -i ~/.ssh/id_rsa_github
EOF

# 创建私活配置
cat > ~/.gitconfig-freelance << 'EOF'
[user]
    name = San Zhang
    email = sanzhang@example.com
[core]
    sshCommand = ssh -i ~/.ssh/id_rsa_coding
EOF

# 设置 Git 别名
echo -e "${YELLOW}设置 Git 别名...${NC}"

cat >> ~/.gitconfig << 'EOF'

[alias]
    identity-company = "!git config user.name '张三' && git config user.email 'zhangsan@company.com'"
    identity-opensource = "!git config user.name 'Zhang San' && git config user.email 'zhangsan@users.noreply.github.com'"
    identity-freelance = "!git config user.name 'San Zhang' && git config user.email 'sanzhang@example.com'"
    current-identity = "!echo '姓名: $(git config user.name)'; echo '邮箱: $(git config user.email)'"
    test-ssh = "!f() { ssh -T git@$1; }; f"
EOF

# 创建全局 gitignore
cat > ~/.gitignore_global << 'EOF'
.DS_Store
Thumbs.db
*.log
node_modules/
dist/
build/
.env
.idea/
.vscode/
EOF

# 显示生成的公钥
echo ""
echo -e "${GREEN}🎉 Git 多身份环境配置完成！${NC}"
echo ""

show_public_key "github"
show_public_key "gitlab" 
show_public_key "coding"

# 测试 SSH 连接
echo -e "${YELLOW}测试 SSH 连接（需要先将公钥添加到对应平台）...${NC}"
echo -e "${BLUE}完成后可以运行以下命令测试：${NC}"
echo "git test-ssh github.com"
echo "git test-ssh gitlab.com" 
echo "git test-ssh e.coding.net"

# 显示使用说明
echo ""
echo -e "${BLUE}📁 目录结构：${NC}"
echo "~/workspace/company/     - 公司项目（自动使用公司身份）"
echo "~/workspace/opensource/  - 开源项目（自动使用开源身份）"
echo "~/workspace/freelance/   - 私活项目（自动使用私活身份）"

echo ""
echo -e "${BLUE}🔧 常用命令：${NC}"
echo "git current-identity     - 查看当前身份"
echo "git identity-company     - 手动切换到公司身份"
echo "git identity-opensource  - 手动切换到开源身份"
echo "git identity-freelance   - 手动切换到私活身份"

echo ""
echo -e "${GREEN}✅ 所有配置已完成！请将上面的公钥添加到对应的 Git 平台。${NC}"
