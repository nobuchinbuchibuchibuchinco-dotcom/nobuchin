import styles from "./page.module.css";

const recentProjects = [
  {
    id: "1",
    name: "nobuchin",
    path: "~/nobuchin",
    lastOpened: "たった今",
    branch: "claude/add-app-recents-LedSf",
    description: "Claude Code Recentsアプリ",
  },
  {
    id: "2",
    name: "my-next-app",
    path: "~/projects/my-next-app",
    lastOpened: "2時間前",
    branch: "main",
    description: "Next.jsプロジェクト",
  },
  {
    id: "3",
    name: "api-server",
    path: "~/work/api-server",
    lastOpened: "昨日",
    branch: "feature/auth",
    description: "Node.js APIサーバー",
  },
  {
    id: "4",
    name: "design-system",
    path: "~/projects/design-system",
    lastOpened: "2日前",
    branch: "main",
    description: "コンポーネントライブラリ",
  },
  {
    id: "5",
    name: "data-pipeline",
    path: "~/work/data-pipeline",
    lastOpened: "先週",
    branch: "develop",
    description: "データ処理パイプライン",
  },
];

function FolderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}

function GitBranchIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>◆</span>
          <span className={styles.logoText}>Claude Code</span>
        </div>
        <nav className={styles.nav}>
          <button className={`${styles.navItem} ${styles.navActive}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Recents
          </button>
          <button className={styles.navItem}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Projects
          </button>
          <button className={styles.navItem}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Search
          </button>
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Recents</h1>
          <button className={styles.newButton}>
            <PlusIcon />
            新しいプロジェクト
          </button>
        </header>

        <div className={styles.projectList}>
          {recentProjects.map((project) => (
            <button key={project.id} className={styles.projectCard}>
              <div className={styles.projectIcon}>
                <FolderIcon />
              </div>
              <div className={styles.projectInfo}>
                <div className={styles.projectName}>{project.name}</div>
                <div className={styles.projectPath}>{project.path}</div>
                {project.description && (
                  <div className={styles.projectDesc}>{project.description}</div>
                )}
              </div>
              <div className={styles.projectMeta}>
                <div className={styles.projectTime}>{project.lastOpened}</div>
                <div className={styles.projectBranch}>
                  <GitBranchIcon />
                  {project.branch}
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
