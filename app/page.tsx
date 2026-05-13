import { RecentProject } from "./api/recents/route";
import styles from "./page.module.css";

async function getRecents(): Promise<RecentProject[]> {
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const os = await import("os");

    const projectsDir = path.join(os.homedir(), ".claude", "projects");
    let projectDirs: string[];
    try {
      projectDirs = await fs.readdir(projectsDir);
    } catch {
      return [];
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

      const stats = await Promise.all(
        files.map(async (f) => {
          const st = await fs.stat(path.join(dirPath, f));
          return { file: f, mtime: st.mtime };
        })
      );
      stats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
      const newest = stats[0];

      let cwd: string = dir.replace(/^-/, "/").replace(/-/g, "/");
      let gitBranch: string | null = null;
      let timestamp: string = newest.mtime.toISOString();

      try {
        const buf = Buffer.alloc(4096);
        const fd = await fs.open(path.join(dirPath, newest.file), "r");
        const { bytesRead } = await fd.read(buf, 0, 4096, 0);
        await fd.close();
        const text = buf.slice(0, bytesRead).toString("utf8");
        const nl = text.indexOf("\n");
        const line = nl === -1 ? text : text.slice(0, nl);
        const parsed = JSON.parse(line);
        if (parsed.cwd) cwd = parsed.cwd;
        if (parsed.gitBranch) gitBranch = parsed.gitBranch;
        if (parsed.timestamp) timestamp = parsed.timestamp;
      } catch {
        // use defaults
      }

      const diff = Date.now() - new Date(timestamp).getTime();
      const min = Math.floor(diff / 60000);
      let lastOpened: string;
      if (min < 1) lastOpened = "たった今";
      else if (min < 60) lastOpened = `${min}分前`;
      else {
        const hr = Math.floor(min / 60);
        if (hr < 24) lastOpened = `${hr}時間前`;
        else {
          const day = Math.floor(hr / 24);
          if (day === 1) lastOpened = "昨日";
          else if (day < 7) lastOpened = `${day}日前`;
          else {
            const wk = Math.floor(day / 7);
            lastOpened = wk === 1 ? "先週" : `${wk}週間前`;
          }
        }
      }

      projects.push({
        id: dir,
        name: path.basename(cwd),
        path: cwd.replace(os.homedir(), "~"),
        lastOpened,
        lastOpenedRaw: timestamp,
        branch: gitBranch,
        sessionCount: files.length,
      });
    }

    projects.sort(
      (a, b) =>
        new Date(b.lastOpenedRaw).getTime() -
        new Date(a.lastOpenedRaw).getTime()
    );
    return projects;
  } catch {
    return [];
  }
}

function FolderIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}

function GitBranchIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SessionBadge({ count }: { count: number }) {
  return <span className={styles.sessionBadge}>{count} session{count !== 1 ? "s" : ""}</span>;
}

export default async function Home() {
  const projects = await getRecents();

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>◆</span>
          <span className={styles.logoText}>Claude Code</span>
        </div>
        <nav className={styles.nav}>
          <button className={`${styles.navItem} ${styles.navActive}`}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Recents
          </button>
          <button className={styles.navItem}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Projects
          </button>
          <button className={styles.navItem}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Search
          </button>
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Recents</h1>
            <p className={styles.subtitle}>
              {projects.length} project{projects.length !== 1 ? "s" : ""} — {`~/.claude/projects`}
            </p>
          </div>
          <button className={styles.newButton}>
            <PlusIcon />
            新しいプロジェクト
          </button>
        </header>

        {projects.length === 0 ? (
          <div className={styles.empty}>
            <p>最近のプロジェクトはありません</p>
            <p className={styles.emptyHint}>
              Claude Codeで作業したプロジェクトがここに表示されます
            </p>
          </div>
        ) : (
          <div className={styles.projectList}>
            {projects.map((project) => (
              <button key={project.id} className={styles.projectCard}>
                <div className={styles.projectIcon}>
                  <FolderIcon />
                </div>
                <div className={styles.projectInfo}>
                  <div className={styles.projectName}>{project.name}</div>
                  <div className={styles.projectPath}>{project.path}</div>
                </div>
                <div className={styles.projectMeta}>
                  <div className={styles.projectTime}>{project.lastOpened}</div>
                  <div className={styles.projectTags}>
                    {project.branch && (
                      <div className={styles.projectBranch}>
                        <GitBranchIcon />
                        {project.branch}
                      </div>
                    )}
                    <SessionBadge count={project.sessionCount} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
