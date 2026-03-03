#!/bin/bash
# JobGenesis - EC2 Production Provisioning Script (Amazon Linux 2023)
# Paste this into the "User Data" section when launching an EC2 instance.

# 1. System Updates & Dependencies
yum update -y
yum install -y git jq curl

# 2. Install Docker
yum install -y docker
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

# 3. Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# 4. Clone the Repository
# NOTE: If your repo is private, you will need to replace this URL with a Personal Access Token URL or use AWS CodeDeploy.
# For example: git clone https://<YOUR_GITHUB_TOKEN>@github.com/yourusername/jobgenesis.git
cd /home/ec2-user
git clone https://github.com/your-repo-url-here/jobgenesis.git
cd jobgenesis

# 5. Environment Variables Injection
# The .env file needs to be created on the cloud instance.
cat <<EOF > .env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
MONGO_URI=mongodb+srv://sohel:sohel123@cluster0.obtsqzz.mongodb.net/?appName=Cluster0
PORT=4000
JWT_SECRET=0b160b275b564df01bf3f29a92e86c16
EOF
cp .env backend/.env
cp .env ml-engine/.env

# 6. Launch the Vanguard Stack
chown -R ec2-user:ec2-user /home/ec2-user/jobgenesis
su - ec2-user -c "cd /home/ec2-user/jobgenesis && docker-compose up --build -d"

echo "JobGenesis Vanguard Deployment Initialized successfully." > /home/ec2-user/deployment_status.txt
