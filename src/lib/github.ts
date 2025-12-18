import { Octokit } from 'octokit';
import { parseAppJson } from './appConfig';
import { AppConfig } from '@/types';

/**
 * Fetches app.json from a GitHub repository
 */
export async function fetchAppJsonFromGitHub(
  owner: string,
  repo: string,
  accessToken: string,
  branch: string = 'main'
): Promise<AppConfig> {
  const octokit = new Octokit({ auth: accessToken });
  
  try {
    // Try app.json first
    try {
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'app.json',
        ref: branch,
      });
      
      if ('content' in response.data) {
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        return await parseAppJson(content);
      } else {
        throw new Error('app.json not found in repository');
      }
    } catch (error) {
      // If app.json doesn't exist, try app.config.js or app.config.ts
      // For now, just throw the error
      throw new Error('app.json not found in repository');
    }
  } catch (error) {
    throw new Error(
      `Failed to fetch app.json from GitHub: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validates GitHub repository access
 */
export async function validateGitHubRepo(
  owner: string,
  repo: string,
  accessToken: string
): Promise<boolean> {
  const octokit = new Octokit({ auth: accessToken });
  
  try {
    await octokit.rest.repos.get({
      owner,
      repo,
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Fetches repository default branch
 */
export async function getDefaultBranch(
  owner: string,
  repo: string,
  accessToken: string
): Promise<string> {
  const octokit = new Octokit({ auth: accessToken });
  
  const response = await octokit.rest.repos.get({
    owner,
    repo,
  });
  
  return response.data.default_branch;
}
