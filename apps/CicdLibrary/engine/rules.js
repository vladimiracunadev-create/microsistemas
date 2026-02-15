export function evaluateRequirements(cfg) {
  const req = [];
  const strategy = cfg.cd?.strategy;

  if (strategy === "ssh") req.push("ssh.host","ssh.user","ssh.remotePath","ssh.restartCmd");
  if (strategy === "docker") req.push("docker.image","docker.remoteCmd");
  if (strategy === "s3") req.push("s3.bucket");

  if (cfg.env?.enabled) {
    req.push("env.stagingBranch");
    if (cfg.env?.prodByTag) req.push("triggers.tags","triggers.tagPattern");
  }

  if (cfg.ops?.healthcheck) req.push("ops.healthcheckUrl");
  if (cfg.ops?.rollback) req.push("ops.rollbackCmd");

  return Array.from(new Set(req));
}

export function requiredSecrets(cfg) {
  const s = new Set();
  if (cfg.cd?.strategy === "ssh") s.add("SSH_PRIVATE_KEY");
  if (cfg.cd?.strategy === "docker") { s.add("SSH_PRIVATE_KEY"); s.add("REGISTRY_TOKEN"); }
  if (cfg.cd?.strategy === "s3") {
    if (!cfg.security?.useOIDC) { s.add("AWS_ACCESS_KEY_ID"); s.add("AWS_SECRET_ACCESS_KEY"); }
    else s.add("OIDC_ROLE_ARN");
  }
  if (cfg.notify?.enabled) s.add("NOTIFY_WEBHOOK_SECRET (opcional)");
  return Array.from(s);
}

export function nonYamlSettings(orchestrator, cfg) {
  const items = [];
  if (cfg.env?.approvalProd) {
    if (orchestrator === "github") items.push("GitHub: Settings → Environments → production → Required reviewers (approval)");
    if (orchestrator === "gitlab") items.push("GitLab: Protected environments / approvals (settings del proyecto)");
    if (orchestrator === "jenkins") items.push("Jenkins: input step / permisos del job (UI)");
  }
  if (cfg.governance?.requiredChecks) {
    if (orchestrator === "github") items.push("GitHub: Settings → Branches → Branch protection rules (required checks)");
    if (orchestrator === "gitlab") items.push("GitLab: pipelines must succeed / approvals (settings)");
  }
  return items;
}
