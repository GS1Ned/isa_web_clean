import { describe, it, expect } from 'vitest';
import { ENV } from './_core/env';

const hasGithubPat = Boolean(ENV.githubPat && ENV.githubPat.length > 10);
const describeGithub = hasGithubPat ? describe : describe.skip;

describeGithub('GitHub PAT Validation', () => {
  it('should validate GitHub PAT has correct permissions', async () => {
    const token = ENV.githubPat;
    console.log('Token length:', token?.length);
    console.log('Token starts with:', token?.substring(0, 10));
    expect(token).toBeDefined();
    expect(token).not.toBe('');

    // Test the token by making a simple API call to GitHub
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API Error:', response.status, errorText);
    }
    expect(response.ok).toBe(true);
    const userData = await response.json();
    expect(userData.login).toBeDefined();

    // Check token scopes
    const scopes = response.headers.get('x-oauth-scopes');
    expect(scopes).toBeDefined();
    expect(scopes).toContain('repo');
    expect(scopes).toContain('workflow');
  });
});
