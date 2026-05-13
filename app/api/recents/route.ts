import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

export interface RecentProject {
  id: string;
  name: string;
  path: string;
  lastOpened: string;
  lastOpenedRaw: string;
  branch: string | null;
  sessionCount: number;
}

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "たった今";
  if (min < 60) return `${min}分前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}時間前`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "昨日";
  if (day < 7) return `${day}日前`;
  const wk = Math.floor(day / 7);
  if (wk === 1) return "先週";
  return `${wk}週間前`;
}

async function readFirstLine(filePath: string): Promise<string> {
  const buf = Buffer.alloc(4096);
  const fd = await fs.open(filePath, "r");
  try {
    const { bytesRead } = await fd.read(buf, 0, 4096, 0);
    const text = buf.slice(0, bytesRead).toString("utf8");
    const nl = text.indexOf("\n");
    return nl === -1 ? text : text.slice(0, nl);
  } finally {
    await fd.close();
  }
}

export async function GET() {
  const projectsDir = path.join(os.homedir(), ".claude", "projects");

  let projectDirs: string[];
  try {
    projectDirs = await fs.readdir(projectsDir);
  } catch {
    return NextResponse.json([]);
  }

  const projects: RecentProject[] = [];

  for (const dir of projectDirs) {
    const dirPath = path.join(projectsDir, dir);
    let files: string[];
    try {
      files = (await fs.readdir(dirPath)).filter((f) => f.endsWith(".jsonl"));
    } catch {
      continue;
    }
    if (files.length === 0) continue;

    // find most recent file by mtime
    const stats = await Promise.all(
      files.map(async (f) => {
        const st = await fs.stat(path.join(dirPath, f));
        return { file: f, mtime: st.mtime };
      })
    );
    stats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    const newest = stats[0];

    // read first line to get cwd and gitBranch
    let cwd: string = dir.replace(/^-/, "/").replace(/-/g, "/");
    let gitBranch: string | null = null;
    let timestamp: string = newest.mtime.toISOString();

    try {
      const line = await readFirstLine(path.join(dirPath, newest.file));
      const parsed = JSON.parse(line);
      if (parsed.cwd) cwd = parsed.cwd;
      if (parsed.gitBranch) gitBranch = parsed.gitBranch;
      if (parsed.timestamp) timestamp = parsed.timestamp;
    } catch {
      // use defaults
    }

    projects.push({
      id: dir,
      name: path.basename(cwd),
      path: cwd.replace(os.homedir(), "~"),
      lastOpened: relativeTime(timestamp),
      lastOpenedRaw: timestamp,
      branch: gitBranch,
      sessionCount: files.length,
    });
  }

  projects.sort(
    (a, b) =>
      new Date(b.lastOpenedRaw).getTime() - new Date(a.lastOpenedRaw).getTime()
  );

  return NextResponse.json(projects);
}
