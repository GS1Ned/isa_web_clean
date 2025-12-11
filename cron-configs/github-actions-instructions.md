# GitHub Actions Setup Instructions

1. Add CRON_SECRET to your GitHub repository secrets:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: CRON_SECRET
   - Value: c11f32585dcc3641dd108e4b6d9c3d4c9a718a41eeab7869775bb8ee97ca3f9b
   - Click "Add secret"

2. Create the workflow file:
   - Copy the generated workflow file to: .github/workflows/isa-news-cron.yml
   - Commit and push to your repository

3. GitHub will automatically run the workflow on schedule
4. You can also trigger manually from Actions tab → "ISA News Collection" → "Run workflow"
